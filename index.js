import express from "express";

const app = express();

app.get('/', (req,res)=> {
    res.json({
        hello: 'hi!',
    }) ;

}) ;





app.listen("3000", ()=> {
    console.log('Server is listening to Port 3000') ;
}) ;