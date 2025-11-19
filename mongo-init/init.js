db = db.getSiblingDB('amazona');

db.createUser({
  user: 'amazonaUser',
  pwd: 'amazonaPass',
  roles: [{ role: 'readWrite', db: 'amazona' }],
});

db.createCollection('products');
