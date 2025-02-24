const fs = require('fs');
const Realm = require('realm');

const realmPath = Realm.defaultPath;
fs.unlink(realmPath, (err) => {
  if (err) {
    console.error('Failed to delete Realm file:', err);
  } else {
    console.log('Realm file deleted successfully');
  }
});
