const express = require('express');
const app = express();
const ejs = require('ejs');
app.set('view engine', 'ejs');
const http = require('http');
const mysql = require('mysql');

// データベース接続情報
const connection = mysql.createConnection({
  host: '',
  user: '',
  password: '',
  database: ''
});

app.get('/', function(req, res) {
  // APIでグローバルIPアドレスを取得する
  const ipApiUrl = 'http://ip.jsontest.com/';

  const start = Date.now();

  http.get(ipApiUrl, (response) => {
    let data = '';
    response.on('data', (chunk) => {
      data += chunk;
    });
    response.on('end', () => {
      const end = Date.now();
      const elapsedTime = end - start;
      const ipAddress = JSON.parse(data).ip;

      // 取得したIPアドレスとレスポンスタイムをデータベースに記録する
      connection.query(
        'INSERT INTO ip_addresses (ip_address, response_time) VALUES (?, ?)',
        [ipAddress, elapsedTime],
        (error, results, fields) => {
          if (error) throw error;
          console.log('IPアドレスと応答時間をデータベースに挿入しました');
        }
      );
      
      // IPアドレスをレンダリングしてクライアントに送信する
      res.render('index.ejs', { ip_address: ipAddress });

      console.log(`レスポンスタイム: ${elapsedTime}ms`);
      console.log(`IPアドレス: ${ipAddress}`)
    });
  }).on('error', (error) => {
    console.error(error);
    res.status(500).send('ipアドレスが取得できませんでした。');
  });
});



//存在しないページの時notfounde.ejsを表示
app.use((req, res, next) => {
  res.status(404).render('./notfound/notfound.ejs');
});

//ポート3000番でサーバ起動
app.listen(3000, () => {
  console.log('localhost:3000');
});
