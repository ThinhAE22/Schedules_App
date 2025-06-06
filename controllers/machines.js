const machinesRouter = require('express').Router();
const Machine = require('../models/machines');
const { userExtractor, requireAdmin } = require('../utils/middleware');

machinesRouter.get('/', async (request, response) => {
    try {
        const machines = await Machine.find({});
        response.json(machines);
    } catch (error) {
        response.status(500).json({ error: 'Failed to fetch machines' });
    }
});

machinesRouter.get('/types', async (req, res, next) => {
  try {
    const machines = await Machine.find({})

    const washingMachines = machines
      .filter((m) => m.washingMachine)
      .map((m) => m.washingMachine)

    const dryerMachines = machines
      .filter((m) => m.dryerMachine)
      .map((m) => m.dryerMachine)

    res.json({ washingMachines, dryerMachines })
  } catch (error) {
    next(error)
  }
})

// Create user (anyone can register, optional: restrict setting admin)
machinesRouter.post('/', userExtractor, requireAdmin, async (req, res, next) => {
    const {washingMachine, dryerMachine} = req.body
  
    if (!washingMachine && !dryerMachine) {
        return res.status(400).json({ error: 'At least one of washingMachine or dryerMachine is required' });
    }
  
    try {
      const machine = new Machine({
        washingMachine,
        dryerMachine,
      })
  
      const savedMachine = await machine.save()
      res.status(201).json(savedMachine)
    } catch (error) {
      if (error.name === 'MongoServerError' && error.code === 11000) {
        return res.status(400).json({ error: 'Machine must be unique' })
      }
      next(error)
    }
  })

machinesRouter.delete('/:id', userExtractor, requireAdmin, async (req, res, next) => {
    try {
      const deletedMachine = await Machine.findByIdAndDelete(req.params.id);
  
      if (!deletedMachine) {
        return res.status(404).json({ error: 'Machine not found' });
      }
  
      res.status(204).end(); // No content
    } catch (error) {
      next(error);
    }
});

module.exports = machinesRouter;