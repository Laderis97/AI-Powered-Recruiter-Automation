/**
 * Integration tests for database operations
 * Uses Testcontainers to spin up PostgreSQL instance
 */

const { GenericContainer, Wait } = require('testcontainers');
const { Client } = require('pg');

describe('Database Integration Tests', () => {
  let container;
  let client;
  let testDbName = 'test_db';

  beforeAll(async () => {
    // Start PostgreSQL container
    container = await new GenericContainer('postgres:15-alpine')
      .withExposedPorts(5432)
      .withEnvironment({
        POSTGRES_DB: testDbName,
        POSTGRES_USER: 'test_user',
        POSTGRES_PASSWORD: 'test_password'
      })
      .withWaitStrategy(Wait.forLogMessage('database system is ready to accept connections'))
      .start();

    // Get container port
    const mappedPort = container.getMappedPort(5432);
    const host = container.getHost();
    
    // Create database client
    client = new Client({
      host,
      port: mappedPort,
      database: testDbName,
      user: 'test_user',
      password: 'test_password'
    });

    await client.connect();
    
    // Create test tables
    await createTestTables();
  }, 60000); // 60 second timeout for container startup

  afterAll(async () => {
    if (client) {
      await client.end();
    }
    if (container) {
      await container.stop();
    }
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await cleanTestData();
  });

  async function createTestTables() {
    const createCandidatesTable = `
      CREATE TABLE IF NOT EXISTS candidates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        status VARCHAR(50) DEFAULT 'applied',
        stage VARCHAR(50) DEFAULT 'screening',
        skills TEXT[],
        experience INTEGER DEFAULT 0,
        resume_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const createJobsTable = `
      CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        company VARCHAR(255) NOT NULL,
        location VARCHAR(255),
        type VARCHAR(50),
        salary VARCHAR(100),
        description TEXT,
        requirements TEXT[],
        status VARCHAR(50) DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const createApplicationsTable = `
      CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        candidate_id INTEGER REFERENCES candidates(id),
        job_id INTEGER REFERENCES jobs(id),
        status VARCHAR(50) DEFAULT 'applied',
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(candidate_id, job_id)
      );
    `;

    await client.query(createCandidatesTable);
    await client.query(createJobsTable);
    await client.query(createApplicationsTable);
  }

  async function cleanTestData() {
    await client.query('DELETE FROM applications');
    await client.query('DELETE FROM candidates');
    await client.query('DELETE FROM jobs');
    await client.query('ALTER SEQUENCE candidates_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE jobs_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE applications_id_seq RESTART WITH 1');
  }

  describe('Candidate Operations', () => {
    test('should insert and retrieve candidate', async () => {
      const candidateData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        skills: ['JavaScript', 'React', 'Node.js'],
        experience: 3
      };

      const insertQuery = `
        INSERT INTO candidates (name, email, phone, skills, experience)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;

      const result = await client.query(insertQuery, [
        candidateData.name,
        candidateData.email,
        candidateData.phone,
        candidateData.skills,
        candidateData.experience
      ]);

      expect(result.rows[0]).toMatchObject({
        name: candidateData.name,
        email: candidateData.email,
        phone: candidateData.phone,
        skills: candidateData.skills,
        experience: candidateData.experience
      });

      // Verify retrieval
      const retrieveQuery = 'SELECT * FROM candidates WHERE email = $1';
      const retrieved = await client.query(retrieveQuery, [candidateData.email]);
      
      expect(retrieved.rows).toHaveLength(1);
      expect(retrieved.rows[0].name).toBe(candidateData.name);
    });

    test('should handle duplicate email constraint', async () => {
      const candidateData = {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        skills: ['Python', 'Django']
      };

      // Insert first candidate
      const insertQuery = `
        INSERT INTO candidates (name, email, skills)
        VALUES ($1, $2, $3)
      `;
      
      await client.query(insertQuery, [
        candidateData.name,
        candidateData.email,
        candidateData.skills
      ]);

      // Try to insert duplicate email
      const duplicateQuery = `
        INSERT INTO candidates (name, email, skills)
        VALUES ($1, $2, $3)
      `;

      await expect(
        client.query(duplicateQuery, [
          'Another Name',
          candidateData.email,
          ['Java']
        ])
      ).rejects.toThrow();
    });

    test('should update candidate information', async () => {
      // Insert candidate
      const insertQuery = `
        INSERT INTO candidates (name, email, skills, experience)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `;
      
      const result = await client.query(insertQuery, [
        'Bob Wilson',
        'bob.wilson@example.com',
        ['Java', 'Spring'],
        2
      ]);

      const candidateId = result.rows[0].id;

      // Update candidate
      const updateQuery = `
        UPDATE candidates 
        SET skills = $1, experience = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
      `;

      const updatedSkills = ['Java', 'Spring', 'Microservices'];
      const updatedExperience = 4;

      const updateResult = await client.query(updateQuery, [
        updatedSkills,
        updatedExperience,
        candidateId
      ]);

      expect(updateResult.rows[0].skills).toEqual(updatedSkills);
      expect(updateResult.rows[0].experience).toBe(updatedExperience);
      expect(updateResult.rows[0].updated_at).not.toBe(updateResult.rows[0].created_at);
    });
  });

  describe('Job Operations', () => {
    test('should insert and retrieve job posting', async () => {
      const jobData = {
        title: 'Senior Software Engineer',
        company: 'Tech Corp',
        location: 'Remote',
        type: 'full-time',
        salary: '$120,000 - $150,000',
        description: 'We are looking for a senior software engineer...',
        requirements: ['5+ years experience', 'JavaScript', 'Node.js', 'React']
      };

      const insertQuery = `
        INSERT INTO jobs (title, company, location, type, salary, description, requirements)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;

      const result = await client.query(insertQuery, [
        jobData.title,
        jobData.company,
        jobData.location,
        jobData.type,
        jobData.salary,
        jobData.description,
        jobData.requirements
      ]);

      expect(result.rows[0]).toMatchObject({
        title: jobData.title,
        company: jobData.company,
        location: jobData.location,
        type: jobData.type,
        salary: jobData.salary,
        requirements: jobData.requirements
      });
    });

    test('should search jobs by requirements', async () => {
      // Insert multiple jobs
      const jobs = [
        {
          title: 'Frontend Developer',
          company: 'Web Corp',
          requirements: ['JavaScript', 'React', 'CSS']
        },
        {
          title: 'Backend Developer',
          company: 'API Corp',
          requirements: ['Node.js', 'PostgreSQL', 'JavaScript']
        },
        {
          title: 'DevOps Engineer',
          company: 'Cloud Corp',
          requirements: ['Docker', 'Kubernetes', 'AWS']
        }
      ];

      for (const job of jobs) {
        await client.query(`
          INSERT INTO jobs (title, company, requirements)
          VALUES ($1, $2, $3)
        `, [job.title, job.company, job.requirements]);
      }

      // Search for JavaScript jobs
      const searchQuery = `
        SELECT * FROM jobs 
        WHERE $1 = ANY(requirements)
        ORDER BY title
      `;

      const javascriptJobs = await client.query(searchQuery, ['JavaScript']);
      expect(javascriptJobs.rows).toHaveLength(2);
      expect(javascriptJobs.rows[0].title).toBe('Backend Developer');
      expect(javascriptJobs.rows[1].title).toBe('Frontend Developer');
    });
  });

  describe('Application Operations', () => {
    test('should create application and prevent duplicates', async () => {
      // Insert candidate and job
      const candidateResult = await client.query(`
        INSERT INTO candidates (name, email, skills)
        VALUES ($1, $2, $3)
        RETURNING id
      `, ['Alice Johnson', 'alice@example.com', ['Python', 'Django']]);

      const jobResult = await client.query(`
        INSERT INTO jobs (title, company, requirements)
        VALUES ($1, $2, $3)
        RETURNING id
      `, ['Python Developer', 'Python Corp', ['Python', 'Django']]);

      const candidateId = candidateResult.rows[0].id;
      const jobId = jobResult.rows[0].id;

      // Create application
      const applicationQuery = `
        INSERT INTO applications (candidate_id, job_id, status)
        VALUES ($1, $2, $3)
        RETURNING *
      `;

      const application = await client.query(applicationQuery, [
        candidateId,
        jobId,
        'applied'
      ]);

      expect(application.rows[0]).toMatchObject({
        candidate_id: candidateId,
        job_id: jobId,
        status: 'applied'
      });

      // Try to create duplicate application
      await expect(
        client.query(applicationQuery, [candidateId, jobId, 'reapplied'])
      ).rejects.toThrow();
    });

    test('should update application status', async () => {
      // Insert candidate, job, and application
      const candidateResult = await client.query(`
        INSERT INTO candidates (name, email, skills)
        VALUES ($1, $2, $3)
        RETURNING id
      `, ['Bob Brown', 'bob@example.com', ['Java', 'Spring']]);

      const jobResult = await client.query(`
        INSERT INTO jobs (title, company, requirements)
        VALUES ($1, $2, $3)
        RETURNING id
      `, ['Java Developer', 'Java Corp', ['Java', 'Spring']]);

      const applicationResult = await client.query(`
        INSERT INTO applications (candidate_id, job_id, status)
        VALUES ($1, $2, $3)
        RETURNING id
      `, [candidateResult.rows[0].id, jobResult.rows[0].id, 'applied']);

      const applicationId = applicationResult.rows[0].id;

      // Update status
      const updateQuery = `
        UPDATE applications 
        SET status = $1 
        WHERE id = $2
        RETURNING *
      `;

      const updated = await client.query(updateQuery, ['interviewing', applicationId]);
      expect(updated.rows[0].status).toBe('interviewing');
    });
  });

  describe('Complex Queries', () => {
    test('should get candidate application history', async () => {
      // Insert test data
      const candidateResult = await client.query(`
        INSERT INTO candidates (name, email, skills)
        VALUES ($1, $2, $3)
        RETURNING id
      `, ['Charlie Davis', 'charlie@example.com', ['JavaScript', 'React']]);

      const candidateId = candidateResult.rows[0].id;

      const jobs = [
        { title: 'Frontend Dev', company: 'Front Corp', requirements: ['JavaScript'] },
        { title: 'React Dev', company: 'React Corp', requirements: ['React'] },
        { title: 'Full Stack', company: 'Full Corp', requirements: ['JavaScript', 'React'] }
      ];

      for (const job of jobs) {
        const jobResult = await client.query(`
          INSERT INTO jobs (title, company, requirements)
          VALUES ($1, $2, $3)
          RETURNING id
        `, [job.title, job.company, job.requirements]);

        await client.query(`
          INSERT INTO applications (candidate_id, job_id, status)
          VALUES ($1, $2, $3)
        `, [candidateId, jobResult.rows[0].id, 'applied']);
      }

      // Get application history
      const historyQuery = `
        SELECT 
          c.name as candidate_name,
          j.title as job_title,
          j.company as job_company,
          a.status as application_status,
          a.applied_at
        FROM applications a
        JOIN candidates c ON a.candidate_id = c.id
        JOIN jobs j ON a.job_id = j.id
        WHERE c.id = $1
        ORDER BY a.applied_at DESC
      `;

      const history = await client.query(historyQuery, [candidateId]);
      
      expect(history.rows).toHaveLength(3);
      expect(history.rows[0].candidate_name).toBe('Charlie Davis');
      expect(history.rows[0].job_title).toBe('Full Stack');
    });

    test('should get job application statistics', async () => {
      // Insert test data
      const jobResult = await client.query(`
        INSERT INTO jobs (title, company, requirements)
        VALUES ($1, $2, $3)
        RETURNING id
      `, ['Popular Job', 'Popular Corp', ['JavaScript']]);

      const jobId = jobResult.rows[0].id;

      const candidates = [
        { name: 'Alice', email: 'alice@test.com', skills: ['JavaScript'] },
        { name: 'Bob', email: 'bob@test.com', skills: ['JavaScript', 'React'] },
        { name: 'Charlie', email: 'charlie@test.com', skills: ['Python'] }
      ];

      for (const candidate of candidates) {
        const candidateResult = await client.query(`
          INSERT INTO candidates (name, email, skills)
          VALUES ($1, $2, $3)
          RETURNING id
        `, [candidate.name, candidate.email, candidate.skills]);

        await client.query(`
          INSERT INTO applications (candidate_id, job_id, status)
          VALUES ($1, $2, $3)
        `, [candidateResult.rows[0].id, jobId, 'applied']);
      }

      // Get statistics
      const statsQuery = `
        SELECT 
          j.title,
          j.company,
          COUNT(a.id) as total_applications,
          COUNT(CASE WHEN a.status = 'applied' THEN 1 END) as pending_applications,
          COUNT(CASE WHEN a.status = 'interviewing' THEN 1 END) as interviewing_applications,
          COUNT(CASE WHEN a.status = 'hired' THEN 1 END) as hired_applications
        FROM jobs j
        LEFT JOIN applications a ON j.id = a.job_id
        WHERE j.id = $1
        GROUP BY j.id, j.title, j.company
      `;

      const stats = await client.query(statsQuery, [jobId]);
      
      expect(stats.rows).toHaveLength(1);
      expect(stats.rows[0].total_applications).toBe(3);
      expect(stats.rows[0].pending_applications).toBe(3);
    });
  });

  describe('Data Integrity', () => {
    test('should enforce foreign key constraints', async () => {
      // Try to create application with non-existent candidate
      await expect(
        client.query(`
          INSERT INTO applications (candidate_id, job_id, status)
          VALUES ($1, $2, $3)
        `, [999, 999, 'applied'])
      ).rejects.toThrow();
    });

    test('should handle cascading deletes', async () => {
      // Insert candidate and job
      const candidateResult = await client.query(`
        INSERT INTO candidates (name, email, skills)
        VALUES ($1, $2, $3)
        RETURNING id
      `, ['Delete Test', 'delete@test.com', ['Test']]);

      const jobResult = await client.query(`
        INSERT INTO jobs (title, company, requirements)
        VALUES ($1, $2, $3)
        RETURNING id
      `, ['Delete Job', 'Delete Corp', ['Test']]);

      const candidateId = candidateResult.rows[0].id;
      const jobId = jobResult.rows[0].id;

      // Create application
      await client.query(`
        INSERT INTO applications (candidate_id, job_id, status)
        VALUES ($1, $2, $3)
      `, [candidateId, jobId, 'applied']);

      // Verify application exists
      let applications = await client.query('SELECT * FROM applications WHERE candidate_id = $1', [candidateId]);
      expect(applications.rows).toHaveLength(1);

      // Delete candidate (should cascade to applications)
      await client.query('DELETE FROM candidates WHERE id = $1', [candidateId]);

      // Verify application is deleted
      applications = await client.query('SELECT * FROM applications WHERE candidate_id = $1', [candidateId]);
      expect(applications.rows).toHaveLength(0);
    });
  });
});
