const fs = require('fs')
const chalk = require('chalk')
const validator = require('validator')


const dirPath = './data'

if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath)
}

const dataPath = './data/contact.json'
if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath,'[]','utf-8')
}

const loadContact = () => {
    const fileBuffer = fs.readFileSync('data/contact.json', 'utf-8')
    const contacts = JSON.parse(fileBuffer)
    return contacts
}

const findContact = (nama) => {
    const contacts = loadContact()
    const contact = contacts.find((contact) => contact.nama.toLowerCase() === nama.toLowerCase())
    return contact
}

const saveContacts = (contacts) => {
    fs.writeFileSync('data/contact.json', JSON.stringify(contacts))
}

const addContact = (contact) => {
    const contacts = loadContact()
    contacts.push(contact)
    saveContacts(contacts)
}

//ceknama duplikat
const cekDuplikat = (nama) => {
    const contacts = loadContact()
    return contacts.find((contact) => contact.nama === nama)
}

const deleteContact = (nama) => {
    const contacts = loadContact()
    const filteredContacts = contacts.filter((contacts) => contacts.nama !== nama)

    saveContacts(filteredContacts)
}

const updateContacts = (contactBaru) => {
    const contacts = loadContact() 
    const filteredContacts = contacts.filter((contacts) => contacts.nama !== contactBaru.oldNama)
    delete contactBaru.oldNama
    filteredContacts.push(contactBaru)
    saveContacts(filteredContacts)
}


module.exports = { loadContact, findContact, addContact, cekDuplikat, deleteContact, updateContacts}