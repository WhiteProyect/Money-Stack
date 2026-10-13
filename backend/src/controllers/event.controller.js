'use strict';

const eventService = require('../services/event.service');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const result = await eventService.listPublic(req.query);
  res.json(result);
});

// Admin (EDITOR+): sin forzar status=PUBLISHED y con filtro ?status=.
const listAdmin = asyncHandler(async (req, res) => {
  const result = await eventService.listPublic(req.query, { admin: true });
  res.json(result);
});

const getBySlug = asyncHandler(async (req, res) => {
  const event = await eventService.getBySlug(req.params.slug);
  res.json({ data: event });
});

const getById = asyncHandler(async (req, res) => {
  const event = await eventService.getById(req.params.id);
  res.json({ data: event });
});

const create = asyncHandler(async (req, res) => {
  const event = await eventService.create(req.body, req.user.id);
  res.status(201).json({ data: event });
});

const update = asyncHandler(async (req, res) => {
  const event = await eventService.update(req.params.id, req.body, req.user.id);
  res.json({ data: event });
});

const setLineup = asyncHandler(async (req, res) => {
  const event = await eventService.setLineup(req.params.id, req.body.lineup);
  res.json({ data: event });
});

module.exports = {
  list,
  listAdmin,
  getBySlug,
  getById,
  create,
  update,
  setLineup,
};
