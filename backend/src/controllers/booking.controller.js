'use strict';

const { randomUUID } = require('crypto');
const bookingService = require('../services/booking.service');
const asyncHandler = require('../utils/asyncHandler');

const create = asyncHandler(async (req, res) => {
  // Honeypot: si viene lleno es un bot. Se responde 201 con un id falso
  // (no se rechaza) y NO se guarda nada.
  const { website, ...body } = req.body;
  if (website) {
    return res.status(201).json({ data: { id: randomUUID() } });
  }
  const id = await bookingService.createPublic(body, req.ip);
  return res.status(201).json({ data: id });
});

const list = asyncHandler(async (req, res) => {
  const result = await bookingService.listAdmin(req.query);
  res.json(result);
});

const getById = asyncHandler(async (req, res) => {
  const booking = await bookingService.getById(req.params.id);
  res.json({ data: booking });
});

const update = asyncHandler(async (req, res) => {
  const booking = await bookingService.update(req.params.id, req.body, req.user.id);
  res.json({ data: booking });
});

module.exports = {
  create,
  list,
  getById,
  update,
};
