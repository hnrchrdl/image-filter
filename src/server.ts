import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // Transform image endpoint
  // takes an image url and sends back a transfored version of that image.
  app.get('/filteredimage', async (req: express.Request, res: express.Response) => {
    const { image_url } = req.query;
    if(!image_url) {
      // send bad request if image_url is missing
      res.statusCode = 400;
      res.send("image_url query param must be present.");
    }
    // transform image
    let filepath: string;
    try {
      filepath = await filterImageFromURL(image_url);  
    }
    catch(err) {
      const { filepath, message} = err;
      res.statusCode = 500;
      res.send(`sorry, something went wrong. reason: ${message}`);
      if(filepath) deleteLocalFiles([filepath]);
      return;
    }

    // send image
    res.sendFile(filepath, () => {
      // cleanup
      deleteLocalFiles([filepath])
    });
    
  })
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();