import express from 'express';

import { StateMachine } from '@lit-protocol/automation';

const automationRouter = express.Router();

const machines: Record<string, StateMachine> = {};

automationRouter.post('/automation/create', async (request, response) => {
  // TODO use request body to create state machines
  const stateMachine = new StateMachine({});
  stateMachine.addState({
    key: 'setup',
    onEnter: async () => {
      console.log('Entered setup state');
    },
    onExit: async () => {
      console.log('Exited setup state');
    },
  });

  if (machines[stateMachine.id]) {
    // Machine chose an ID that is already in use. Highly unlikely. Make user retry
    return response.status(500).json({ error: 'Could not create machine' });
  }

  machines[stateMachine.id] = stateMachine;

  response.status(200).json({
    id: stateMachine.id,
    status: stateMachine.status,
  });
});

automationRouter.post('/automation/start/:id/:state', async (request, response) => {
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
});

automationRouter.post('/automation/stop/:id', async (request, response) => {
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
});

export default automationRouter;
