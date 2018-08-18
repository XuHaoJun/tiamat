import { Router } from 'express';

const router = new Router();

router.use('*', (req, res) => {
  res.status(404).send('Not found');
});

export default router;
