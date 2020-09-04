'use strict'

const path = require('path');
const chai = require('chai');
const chaiHttp = require('chai-http');
const { google } = require('googleapis');
const { authenticate } = require('@google-cloud/local-auth');
const { expect } = require('chai');
const gmail = google.gmail('v1');

chai.use(chaiHttp);

let email = 'dyliky@getnada.com';
let randomCat;
let randomDog;
let randomFox;

let runSample = async () => {
    // Obtain user credentials to use for the request
    const auth = await authenticate({
      keyfilePath: path.join(__dirname, 'credentials.json'),
      scopes: [
        'https://mail.google.com/',
        'https://www.googleapis.com/auth/gmail.modify',
        'https://www.googleapis.com/auth/gmail.compose',
        'https://www.googleapis.com/auth/gmail.send',
      ],
    });
    google.options({auth});
  
    // You can use UTF-8 encoding for the subject using the method below.
    // You can also just use a plain string if you don't need anything fancy.
    const subject = '🤘 Hello 🤘';
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
      'From: Jack Pirus <jack.pirus.test@google.com>',
      `To: Someone Else <${email}>`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${utf8Subject}`,
      '',
      `<b>Random Cat:</b> ${randomCat}\n<b>Random Dog:</b> ${randomDog}\n<b>Random Fox:</b> ${randomFox}\n`
    ];
    const message = messageParts.join('\n');
  
    // The body needs to be base64url encoded.
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  
    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });
    // console.log(res.data);
    return res;
};

describe('Autotesting sample', function () {
    this.timeout(30000);
    describe('Get animals', () => {
        it('Get random cat', async () => {
            return chai.request('https://aws.random.cat')
            .get('/meow')
            .then(res => {
                expect(res).to.have.status(200);
                expect(res.ok).to.equal(true);
                expect(res.body).to.be.an('object');
                expect(res.body.file).to.be.an('string').to.include('https://purr.objects-us-east-1.dream.io/i/');
                console.log(res.body.file)
                randomCat = res.body.file;
            })
            .catch(err => {
                throw err
            });
        });
        it('Get random dog', async () => {
            return chai.request('https://random.dog')
            .get('/woof.json')
            .then(res => {
                expect(res).to.have.status(200);
                expect(res.ok).to.equal(true);
                expect(res.body).to.be.an('object');
                expect(res.body.fileSizeBytes).to.be.an('number');
                expect(res.body.url).to.be.an('string').to.include('https://random.dog/');
                console.log(res.body.url)
                randomDog = res.body.url;
            })
            .catch(err => {
                throw err
            });
        });
        it('Get random fox', async () => {
            return chai.request('https://randomfox.ca')
            .get('/floof/')
            .then(res => {
                expect(res).to.have.status(200);
                expect(res.ok).to.equal(true);
                expect(res.body).to.be.an('object');
                expect(res.body.image).to.be.an('string').to.include('https://randomfox.ca/images/');
                expect(res.body.link).to.be.an('string').to.include('https://randomfox.ca/');
                console.log(res.body.link)
                randomFox = res.body.link;
            })
            .catch(err => {
                throw err
            });
        });
        it('Should send message', async () => {
            return runSample()
            .then(res => {
                expect(res).to.have.status(200);
                expect(res).to.have.headers;
                expect(res.statusText).to.be.an('string').to.equal('OK');
                expect(res.request).to.be.an('object');
                expect(res.request.responseURL).to.be.an('string').to.equal('https://www.googleapis.com/gmail/v1/users/me/messages/send');
                expect(res.data).to.be.an('object');
                expect(res.data.id).to.be.an('string');
                expect(res.data.threadId).to.be.an('string');
                expect(res.data.labelIds).to.be.an('array');
                expect(res.data.labelIds[0]).to.be.an('string').to.equal('SENT');
            })
            .catch(err => {
                throw err
            });
        });
    });
});