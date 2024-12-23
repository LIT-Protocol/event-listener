import express, { Response } from 'express';

import { StateMachine } from '@lit-protocol/event-listener';

const automationRouter = express.Router();

const machines: Record<string, StateMachine> = {};

function handleError(e: unknown, response: Response) {
  console.error(e);
  response.status(500).json({
    error: e,
  });
}

automationRouter.post('/automation/create', async (request, response) => {
  try {
    // TODO validate state machine definition with zod
    // TODO accept state machine starting state
    console.log(`create machine payload: ${JSON.stringify(request.body)}`);

    const {
      debug = true,
      privateKey,
      litContractsConfig,
      litNodeClientConfig,
      states,
      transitions,
    } = request.body;

    const stateMachine = StateMachine.fromDefinition({
      debug,
      privateKey,
      litContracts: { debug, ...litContractsConfig },
      litNodeClient: { debug, ...litNodeClientConfig },
      states,
      transitions,
    });

    if (machines[stateMachine.id]) {
      // Machine chose an ID that is already in use. Highly unlikely. Force user to retry
      throw new Error('Server failed to create machine. Try again');
    }

    machines[stateMachine.id] = stateMachine;

    response.status(200).json({
      id: stateMachine.id,
      status: stateMachine.status,
    });
  } catch (e) {
    handleError(e, response);
  }
});

automationRouter.post('/automation/start/:id/:state', async (request, response) => {
  try {
    const { id, state } = request.params;
    const machine = machines[id];

    if (!machine) {
      return response.status(404).json({ error: 'Machine not found' });
    }

    if (machine.isRunning) {
      return response.status(400).json({ error: 'Machine is already started' });
    }

    await machine.startMachine(state);
    response.status(200).json({ id: machine.id, status: machine.status });
  } catch (e) {
    handleError(e, response);
  }
});

automationRouter.post('/automation/stop/:id', async (request, response) => {
  try {
    const { id } = request.params;
    const machine = machines[id];

    if (!machine) {
      return response.status(404).json({ error: 'Machine not found' });
    }

    if (!machine.isRunning) {
      return response.status(400).json({ error: 'Machine is already stopped' });
    }

    await machine.stopMachine();
    response.status(200).json({ id: machine.id, status: machine.status });
  } catch (e) {
    handleError(e, response);
  }
});

export default automationRouter;
