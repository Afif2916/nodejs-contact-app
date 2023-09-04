const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const { loadContact, findContact, addContact, cekDuplikat, deleteContact, updateContacts } = require('./utils/contact')
const { render } = require('ejs')
const { body, validationResult, check } = require('express-validator')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const flash = require('connect-flash')


const app = express ()
const port = 3000

app.set('view engine', 'ejs')

//thirdparty
app.use(expressLayouts)


//built in middleware
app.use(express.static('public'))
app.use(express.urlencoded({extended: true}))

//konfigurasiflash
app.use(cookieParser('secret'))
app.use(session({
    cookie: {maxAge: 6000}, 
    secret: 'secret', 
    resave: true,
    saveUninitialized: true
}))

app.use(flash())

app.get('/', (req,res) => {
   const mahasiswa = [
    {
        nama: 'Afif Bangkit Nur Rahmaan',
        email: 'afif2916@gmail.com'
    }, 
    {
        nama: 'Abib', 
        email: 'apip2705@gmail.com'
    }, 
    {
        nama: 'Muhammad Sumbul', 
        email: 'sumbul@gmail.com'
    }
   ]
   res.render('index', {
    //nama: 'Wleowleo',
    layout: 'layouts/main-layouts', 
    tittle: 'Halaman home', 
    mahasiswa: mahasiswa})
})

app.get('/about', (req,res) => {
    res.render('about', {
        tittle: 'Halaman About', 
        layout: 'layouts/main-layouts' })
})

//halaman kontak
app.get('/contact', (req,res) => {
    const contacts = loadContact()
    contacts.sort((a, b) => {
        const namaA = a.nama.toUpperCase();
        const namaB = b.nama.toUpperCase();
        if (namaA < namaB) {
            return -1;
        }
        if (namaA > namaB) {
            return 1;
        }
        return 0;
    });
    res.render('contact', {
        tittle: 'Halaman Kontak', 
        layout: 'layouts/main-layouts',
        contacts, 
        message: req.flash('msg'),
       
    })
})

//halaman tambah data
app.get('/contact/add', (req, res) => {
    res.render('add-contact', {
        tittle: 'Form Tambah Kontak', 
        layout: 'layouts/main-layouts'
    })
})

//proses input data
app.post('/contact' , 
[
body('nama').custom((value) => {
    const duplikat = cekDuplikat(value)
    if(duplikat) {
        throw new Error('Nama Kontak Sudah Ada')
    }
    return true

}),    
check('email', 'Email Tidak Valid').isEmail(), 
check('nohp', 'No Hp Tidak Valid').isMobilePhone('id-ID')
], 
(req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        //return res.status(400).json({errors: errors.array()})
        res.render('add-contact', {
            tittle: 'Form Tambah Kontak', 
            layout: 'layouts/main-layouts',
            errors: errors.array()
        })
    } else {
        addContact(req.body)
        req.flash('msg' , 'Data Kontak Sudah ditambahkan')
        res.redirect('/contact')
    }

})


//hapus kontak
app.get('/contact/delete/:nama', (req,res) => {
    const contact = findContact(req.params.nama)

    if(!contact) {
        res.status(404)
        res.send('<h1> Data Tidak Ditemukan <h1>')
    } else {
     deleteContact(req.params.nama)
     req.flash('msg' , 'Data Kontak Sudah dihapus')
     res.redirect('/contact')   
    }
})

//form ubah data kontak
app.get('/contact/edit/:nama', (req, res) => {
    const contact = findContact(req.params.nama)

    res.render('edit-contact', {
        tittle: 'Form Ubah Data Kontak', 
        layout: 'layouts/main-layouts',
        contact,
    })
})

//proses ubah data
app.post('/contact/update' , 
[
body('nama').custom((value, {req}) => {
    const duplikat = cekDuplikat(value)
    if (value !== req.body.oldNama && duplikat) {
        throw new Error('Nama Kontak Sudah Ada')
    }
    return true

}),    
check('email', 'Email Tidak Valid').isEmail(), 
check('nohp', 'No Hp Tidak Valid').isMobilePhone('id-ID')
], 
(req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        //return res.status(400).json({errors: errors.array()})
        res.render('edit-contact', {
            tittle: 'Form Ubah Data Kontak', 
            layout: 'layouts/main-layouts',
            errors: errors.array(),
            contact: req.body,
        })
    } else {
        
        updateContacts(req.body)
        req.flash('msg' , 'Data Kontak berhasil Di ubah')
        res.redirect('/contact')
    }

})


//detail kontak
app.get('/contact/:nama', (req,res) => {
    const contact = findContact(req.params.nama)

    res.render('detail', {
        tittle: 'Detail Kontak', 
        layout: 'layouts/main-layouts',
        contact
    })
})




app.use('/', (req,res) => {
    res.status(404)
    res.send('404 not Found')
})


app.listen(port, () => {
    console.log(`Server listening to port ${port}`)
})
