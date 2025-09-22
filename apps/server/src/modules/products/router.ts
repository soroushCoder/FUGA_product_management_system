import { Router } from 'express';
import { upload } from '../../middlewares/upload';
import { validate, Schemas } from '../../middlewares/validate.js';
import { list, get, create, update, remove } from './controller.js';

const router = Router();

router.get('/', list);

router.get('/:id',
  validate(Schemas.id, 'params'),
  get
);

router.post('/',
  upload.single('cover'),
  validate(Schemas.create),
  create
);

router.patch('/:id',
  upload.single('cover'),
  validate(Schemas.id, 'params'),
  validate(Schemas.update),
  update
);

router.delete('/:id',
  validate(Schemas.id, 'params'),
  remove
);

export default router;
