'use strict';

const artistService = require('../services/artist.service');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const result = await artistService.listPublic(req.query);
  res.json(result);
});

const getBySlug = asyncHandler(async (req, res) => {
  const artist = await artistService.getBySlug(req.params.slug);
  res.json({ data: artist });
});

const getById = asyncHandler(async (req, res) => {
  const artist = await artistService.getById(req.params.id);
  res.json({ data: artist });
});

const create = asyncHandler(async (req, res) => {
  const artist = await artistService.create(req.body);
  res.status(201).json({ data: artist });
});

const update = asyncHandler(async (req, res) => {
  const artist = await artistService.update(req.params.id, req.body);
  res.json({ data: artist });
});

module.exports = {
  list,
  getBySlug,
  getById,
  create,
  update,
};
