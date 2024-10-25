'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const password = await bcrypt.hash('11223344', 10);
    await queryInterface.bulkInsert('Users', [
      {
        email: 'user@gmail.com',
        password: password,
        role: 'user',
        name: 'Alejandro Garnacho',
        photo: 'user-1.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: 'company@gmail.com',
        password: password,
        role: 'company',
        name: 'Facundo Pellistri',
        photo: 'user-2.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: 'consultant@gmail.com',
        password: password,
        role: 'consultant',
        name: 'Rasmus Hojlund',
        photo: 'user-3.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: 'admin@gmail.com',
        password: password,
        role: 'admin',
        name: 'Bruno Fernandes',
        photo: 'user-4.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
