const crypto = require('crypto');

// Simular creación de usuario admin
const email = 'rcortesesquivel@gmail.com';
const password = 'Maquinaapp2026+';
const name = 'Administrador';
const role = 'admin';

// Generar openId basado en email
const openId = `email:${email}`;

// Hash simple de contraseña (en producción usar bcrypt)
const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

console.log('=== USUARIO ADMIN A CREAR ===');
console.log(`Email: ${email}`);
console.log(`Nombre: ${name}`);
console.log(`Rol: ${role}`);
console.log(`OpenID: ${openId}`);
console.log(`Password Hash: ${passwordHash.substring(0, 20)}...`);
console.log('\n=== SQL INSERT ===');
console.log(`INSERT INTO users (email, name, role, openId, isPriority, createdAt, updatedAt) VALUES ('${email}', '${name}', '${role}', '${openId}', 1, NOW(), NOW());`);
