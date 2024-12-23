// @ts-ignore supertest is not a module
import request from 'supertest';

import {
  LIT_EVM_CHAINS,
  LIT_NETWORK,
  LIT_NETWORK_VALUES,
} from '@lit-protocol/constants';

import { app } from '../src/app';

const BASIC_MACHINE_CONFIG = {
  litNodeClientConfig: {
    litNetwork: LIT_NETWORK.DatilDev,
  },
  litContractsConfig: {},
  states: [
    {
      key: 'setup',
    },
  ],
  transitions: [],
};

describe('Automation Endpoints', () => {
  it('should create a machine and return the correct response', async () => {
    const response = await request(app)
      .post('/automation/create')
      .send(BASIC_MACHINE_CONFIG);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('status');
    expect(response.body).toEqual({ id: expect.any(String), status: 'stopped' });
  });

  it('should start a machine and return the correct response', async () => {
    // First, create a machine
    const createResponse = await request(app)
      .post('/automation/create')
      .send(BASIC_MACHINE_CONFIG);

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
      .send(BASIC_MACHINE_CONFIG);

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
