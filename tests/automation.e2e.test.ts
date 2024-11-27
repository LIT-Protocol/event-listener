// @ts-ignore supertest is not a module
import request from 'supertest';

import { app } from '../src/app';

describe('Automation Endpoints', () => {
  it('should create a machine and return the correct response', async () => {
    const response = await request(app)
      .post('/automation/create')
      .send({}); // TODO add machine definition

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('status');
    expect(response.body).toEqual({ id: expect.any(String), status: 'stopped' });
  });

  it('should start a machine and return the correct response', async () => {
    // First, create a machine
    const createResponse = await request(app)
      .post('/automation/create')
      .send({}); // TODO add machine definition

    const machineId = createResponse.body.id;

    // Then, start the machine
    const startResponse = await request(app)
      .post(`/automation/start/${machineId}/setup`)
      .send();

    expect(startResponse.status).toBe(200);
    expect(startResponse.body).toEqual({ id: machineId, status: 'running' });
  });

  it('should stop a machine and return the correct response', async () => {
    // First, create a machine
    const createResponse = await request(app)
      .post('/automation/create')
      .send({}); // TODO add machine definition

    const machineId = createResponse.body.id;

    // Start the machine
    await request(app)
      .post(`/automation/start/${machineId}/setup`)
      .send();

    // Then, stop the machine
    const stopResponse = await request(app)
      .post(`/automation/stop/${machineId}`)
      .send();

    expect(stopResponse.status).toBe(200);
    expect(stopResponse.body).toEqual({ id: machineId, status: 'stopped' });
  });
});
