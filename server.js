const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const knex = require('knex');
const bcrypt = require('bcrypt-nodejs')

const db = knex({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    user: 'postgres',
    password: 'test',
    database: 'yourhealth'
  }
});


const app = express();
app.use(bodyParser.json())
app.use(cors())


// app.get('/', (req, res) => {
//   res.send(database.users);
// })

//===========================================
//ROUTES

//AUTH
app.post('/register', (req, res) => {
  const { email, nama, gender, password } = req.body;
  const hash = bcrypt.hashSync(password);
  db.transaction(trx => {
    trx.insert({
      hash: hash,
      email: email
    })
      .into('login')
      .returning('email')
      .then(loginEmail => {
        return trx('users')
          .returning('*')
          .insert({
            email: loginEmail[0],
            nama: nama,
            gender: gender
          })
          .then(user => {
            res.json(user[0]);
          })
      })
      .then(trx.commit)
      .catch(trx.rollback)
  })
    .catch(err => res.status(400).json('Unable to register'))
})

app.post('/login', passport.authenticate('local'), (req, res) => {  
  db.select('email', 'hash').from('login')
    .where('email', '=', req.body.email)
    .then(data => {
      const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
      if (isValid) {
        return db.select('*').from('users')
          .where('email', '=', req.body.email)
          .then(user => {
            res.json(user[0])
          })
          .catch(err => res.status(400).json('Unable to get user'))
      } else {
        res.status(400).json('Wrong credentials')
      }
    })
    .catch(err => res.status(400).json('Wrong credentials'))
})



app.post('/registerahli', (req, res) => {
  const { email, nama, password, spesialis, kota_praktik, no_hp, pengalaman, pendidikan, tempat_praktik } = req.body;
  const hash = bcrypt.hashSync(password);
  db.transaction(trx => {
    trx.insert({
      hash: hash,
      email: email,
    })
      .into('login')
      .returning('email')
      .then(loginEmail => {
        return trx('ahlikesehatan')
          .returning('*')
          .insert({
            email: loginEmail[0],
            nama: nama,
            password: password,
            spesialis: spesialis,
            kota_praktik: kota_praktik,
            no_hp: no_hp
            // pengalaman: pengalaman,
            // pendidikan: pendidikan,
            // tempat_praktik: tempat_praktik,
          })
          .then(user => {
            res.json(user[0]);
          })
      })
      .then(trx.commit)
      .catch(trx.rollback)
  })
    .catch(err => res.status(400).json('Ada yang salah'))
})

app.post('/loginahli', (req, res) => {
  db.select('email', 'hash').from('login')
    .where('email', '=', req.body.email)
    .then(data => {
      const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
      if (isValid) {
        return db.select('*').from('ahlikesehatan')
          .where('email', '=', req.body.email)
          .then(user => {
            res.json(user[0])
          })
          .catch(err => res.status(400).json('Unable to get user'))
      } else {
        res.status(400).json('Wrong credentials')
      }
    })
    .catch(err => res.status(400).json('Wrong credentials'))
})

app.put('/upload', (req, res) => {
  const { id, dokumen } = req.body;
  db('ahlikesehatan').where('ahlikesehatan_id', '=', id)
    .update({
      dokumen_pendukung: dokumen
    })
    .then(dokumen_kesehatan => {
      res.json(dokumen_kesehatan[0]);
    })
    .catch(err => res.status(400).json('Unable to get entries'))
})

app.get('/profile/:id', (req, res) => {
  const { id } = req.params;
  db.select('*').from('users').where({ id })
    .then(user => {
      if (user.length) {
        res.json(user[0])
      } else {
        res.status(400).json('Not Found')
      }
    })
    .catch(err => res.status(400).json('Error getting user'))
})


//ARTICLE
app.post('/article/:id/comment/new', (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;
  db('article')
  .where('id', '=', id)
  .update({
    comment: comment,
  }).then(res.send('Comment Sent to id :' + id))
})

//==========================================
app.get('/article', (req, res) => {
  db.select('*').from('article')
    .then(article => {
      if (article) {
        res.json(article)
      } else {
        res.status(400).json('Not Found')
      }
    })
    .catch(err => res.status(400).json('Error getting article'))
})

//SHOW
//SHOW MORE INFO ABOUT ARTICLE
app.get('/article/:id', (req, res) => {
  const { id } = req.params;
  //FIND THE ARTICLE WITH PROVIDED
  db.select('*').from('article').where({ id })
    .then(article => {
      if (article) {
        res.json(article[0])
      } else {
        res.status(400).json('Not Found')
      }
    })
    .catch(err => res.status(400).json('Error getting article'))
})


//PENYAKIT
//==========================================
app.get('/penyakit', (req, res) => {
  db.select('*').from('penyakit')
    .then(penyakit => {
      if (penyakit) {
        res.json(penyakit);
      } else {
        res.status(400).json('Not Found');
      }
    })
    .catch(err => res.status(400).json('Error getting penyakit'));
})


//SHOW
//SHOW MORE INFO ABOUT ARTICLE
app.get('/penyakit/:penyakit_id', (req, res) => {
  const { penyakit_id } = req.params;
  //FIND THE ARTICLE WITH PROVIDED
  db.select('*').from('penyakit').where({ penyakit_id })
    .then(penyakit => {
      if (penyakit) {
        res.json(penyakit[0])
      } else {
        res.status(400).json('Not Found')
      }
    })
    .catch(err => res.status(400).json('Error getting article'))
})

app.post('/article', (req, res) => {
  res.send('You hit the post route')
  //get data from form and add to article
  const { nama, deskripsi, penulis, gambar } = req.body;
  db('article').insert({
    nama: nama,
    deskripsi: deskripsi,
    penulis: penulis,
    gambar: gambar
  }).then(console.log)
})

//AHLI
//==========================================
app.get('/daftarahli', (req, res) => {
  db.select('*').from('ahlikesehatan')
    .then(ahli => {
      if (ahli) {
        res.json(ahli)
      } else {
        res.status(400).json('Not Found')
      }
    })
    .catch(err => res.status(400).json('Error getting ahli'))
})

//SHOW AHLI
//SHOW MORE INFO ABOUT AHLI
app.get('/daftarahli/:ahlikesehatan_id', (req, res) => {
  const { ahlikesehatan_id } = req.params;
  //FIND THE EVENT WITH PROVIDED
  db.select('*').from('ahlikesehatan').where({ ahlikesehatan_id })
    .then(ahli => {
      if (ahli) {
        res.json(ahli[0])
      } else {
        res.status(400).json('Not Found')
      }
    })
    .catch(err => res.status(400).json('Error getting ahli'))
})

//EVENT
//==========================================
app.get('/eventkesehatan', (req, res) => {
  db.select('*').from('eventkesehatan')
    .then(event => {
      if (event) {
        res.json(event)
      } else {
        res.status(400).json('Not Found')
      }
    })
    .catch(err => res.status(400).json('Error getting event'))
})

//SHOW EVENT
//SHOW MORE INFO ABOUT EVENT
app.get('/eventkesehatan/:event_id', (req, res) => {
  const { event_id } = req.params;
  //FIND THE EVENT WITH PROVIDED
  db.select('*').from('eventkesehatan').where({ event_id })
    .then(event => {
      if (event) {
        res.json(event[0])
      } else {
        res.status(400).json('Not Found')
      }
    })
    .catch(err => res.status(400).json('Error getting event'))
})

//EVENT
//==========================================
app.get('/berita', (req, res) => {
  db.select('*').from('berita')
    .then(berita => {
      if (berita) {
        res.json(berita)
      } else {
        res.status(400).json('Not Found')
      }
    })
    .catch(err => res.status(400).json('Error getting berita'))
})

//SHOW BERITA
//SHOW MORE INFO ABOUT BERITA
app.get('/berita/:berita_id', (req, res) => {
  const { berita_id } = req.params;
  //FIND THE EVENT WITH PROVIDED
  db.select('*').from('berita').where({ berita_id })
    .then(berita => {
      if (berita) {
        res.json(berita[0])
      } else {
        res.status(400).json('Not Found')
      }
    })
    .catch(err => res.status(400).json('Error getting berita'))
})


// /signin --> Post = Success/fail
// /register --> post = user
// /profile/:userId --> GET
// /image

app.listen(3000, () => {
  console.log('This is working, thanks!')
});
