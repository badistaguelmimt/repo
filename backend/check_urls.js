import https from 'https';

const urls = [
  'https://upload.wikimedia.org/wikipedia/commons/b/bd/Golden_Retriever_Dogo_Argentino_Mix_puppy.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/5/5b/Mainecoon_cat.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/3/37/Oryctolagus_cuniculus_f._domestica_-_Dwerghangoor_2.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/b/b1/Russian_Blue_Cat_-_2022-07-21.jpg'
];

urls.forEach(url => {
  https.get(url, (res) => {
    console.log(`${res.statusCode} : ${url}`);
  }).on('error', (e) => {
    console.error(e);
  });
});
