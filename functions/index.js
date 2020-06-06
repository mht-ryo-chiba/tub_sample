const functions = require('firebase-functions');
const swaggerJSDoc = require('swagger-jsdoc');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

/**
 * @swagger
 * /getHealthcare:
 *   get:
 *     description: 身長と体重を渡すとBMI,適正体重、肥満度を返してくれる
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: weight
 *         description: 体重(Kg)
 *         in: query
 *         required: true
 *         type: integer
 *       - name: height
 *         description: 身長(Cm)
 *         in: query
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: 成功時
 *         schema:
 *           type: object
 *           properties:
 *             bmi:
 *               type: integer
 *               format: int64
 *               description: BMI
 *               example: 22
 *             suitable_weight:
 *               type: integer
 *               format: int64
 *               description: 適正体重
 *               example: 65
 *             degree_of_obesity:
 *               type: string
 *               description: 肥満度
 *               example: 普通
 *       400:
 *         description: パラメータ不足
 *         schema:
 *           type: object
 *           properties:
 *             error_message:
 *               type: string
 *               description: エラー・メッセージ
 *               example: weightは必須です
 */
exports.getHealthcare = functions.https.onRequest((request, response) => {
 if(typeof(request.query.weight) == "undefined") {
  response.status(400).json({"error_message": "weightは必須です"});
  return;
 }
 if(typeof(request.query.height) == "undefined") {
  response.status(400).json({"error_message": "heightは必須です"});
  return;
 }
 var weight = request.query.weight;
 var height = request.query.height;

 response.status(200).json(getMedicalParams(weight, height));
});

/**
 * @swagger
 * /postHealthcare:
 *   post:
 *     description: 身長と体重を渡すとBMI,適正体重、肥満度を返してくれる
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             weight:
 *               description: 体重(Kg)
 *               example: 60
 *               type: integer
 *             height:
 *               description: 身長(Cm)
 *               type: integer
 *               example: 170
 *     responses:
 *       200:
 *         description: 成功時
 *         schema:
 *           type: object
 *           properties:
 *             bmi:
 *               type: integer
 *               format: int64
 *               description: BMI
 *               example: 22
 *             suitable_weight:
 *               type: integer
 *               format: int64
 *               description: 適正体重
 *               example: 65
 *             degree_of_obesity:
 *               type: string
 *               description: 肥満度
 *               example: 普通
 *       400:
 *         description: パラメータ不足
 *         schema:
 *           type: object
 *           properties:
 *             error_message:
 *               type: string
 *               description: エラー・メッセージ
 *               example: weightは必須です
 *       405:
 *         description: メゾットが存在しない
 *         schema:
 *           type: object
 *           properties:
 *             error_message:
 *               type: string
 *               description: エラー・メッセージ
 *               example: 該当のメゾットは存在しません
 */
exports.postHealthcare = functions.https.onRequest((request, response) => {
 if(request.method !== 'POST') {
  response.status(405).json({"error_message": "該当のメゾットは存在しません"});
  return;
 }

 if(typeof(request.body.weight) == "undefined") {
  response.status(400).json({"error_message": "weightは必須です"});
  return;
 }
 if(typeof(request.body.height) == "undefined") {
  response.status(400).json({"error_message": "heightは必須です"});
  return;
 }
 var weight = request.body.weight;
 var height = request.body.height;

 response.status(200).json(getMedicalParams(weight, height));
});

function getMedicalParams(weight, height) {
 // BMIの算出
 var bmi = Math.floor((weight * 10000 / (height * height)) * 100) / 100;

 // 適正体重の算出

 var suitable_weight = (height * height * 22) / 10000;
 // 肥満度の判定
 var degree_of_obesity = "";
 if(bmi < 18.5) {
  degree_of_obesity = "痩せている";
 } else if(bmi < 25) {
  degree_of_obesity = "普通";
 } else if(bmi < 30) {
  degree_of_obesity = "肥満Lv1";
 } else if(bmi < 35) {
  degree_of_obesity = "肥満Lv2";
 } else if(bmi < 40) {
  degree_of_obesity = "肥満Lv3";
 } else {
  degree_of_obesity = "肥満Lv4";
 }

 return {
  "bmi":bmi,
  "suitable_weight":suitable_weight,
  "degree_of_obesity":  degree_of_obesity
 };
}


//swaggerの基本定義
var options = {
 swaggerDefinition: {
  info: {
   title: "6/6 TUBサンプル",
   description: "6月6日向けのSwaggerサンプルです！",
   version: "1.0.0."
  },
  host: "us-central1-tub-89275.cloudfunctions.net",
  basePath: '/',
  schemes: ["https"],
 },
 apis: ["./index.js"] //自分自身を指定。外部化した場合は、そのファイルを指定。配列で複数指定も可能。
};

var swaggerSpec = swaggerJSDoc(options);

//swaggerを返すAPI
exports.api_docs = functions.https.onRequest((request, response) => {
 response.setHeader("Content-Type", "text/plain");
 response.send(swaggerSpec);
});
