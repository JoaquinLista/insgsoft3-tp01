import { Router } from 'express';
import { getPedidos, postPedido, patchEstadoPedido } from '../controllers/pedidosController.js';

const router = Router();

router.get('/', getPedidos);
router.post('/', postPedido);
router.patch('/:id', patchEstadoPedido);

export default router;
