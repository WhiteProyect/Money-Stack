'use strict';

const adminUserService = require('../services/adminUser.service');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const result = await adminUserService.list(req.query);
  res.json(result);
});

const getById = asyncHandler(async (req, res) => {
  const admin = await adminUserService.getById(req.params.id);
  res.json({ data: admin });
});

const create = asyncHandler(async (req, res) => {
  const admin = await adminUserService.create(req.body);
  res.status(201).json({ data: admin });
});

const update = asyncHandler(async (req, res) => {
  const admin = await adminUserService.update(req.user.id, req.params.id, req.body);
  res.json({ data: admin });
});

const resetPassword = asyncHandler(async (req, res) => {
  await adminUserService.resetPassword(req.params.id, req.body.newPassword);
  res.status(204).end();
});

const unlock = asyncHandler(async (req, res) => {
  await adminUserService.unlock(req.params.id);
  res.status(204).end();
});

module.exports = {
  list,
  getById,
  create,
  update,
  resetPassword,
  unlock,
};
