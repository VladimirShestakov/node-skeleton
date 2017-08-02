const router = require('express').Router();
const services = require('./../services');
/**
 * Пользователи
 */
require('./Users')(router, services);
/**
 * Новости
 */
require('./News')(router, services);
/**
 * Чаты
 */

module.exports = router;