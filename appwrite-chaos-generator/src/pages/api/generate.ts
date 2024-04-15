import { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { apiEndpoint, projectId, apiKey, databaseId, collectionId, recordAmount, threading } = req.body;

    // Get the absolute path to the seeder.py script
    const scriptPath = path.join(process.cwd(), 'scripts', 'seeder.py');

    // Execute the Python script
    const pythonProcess = exec(`python ${scriptPath} ${apiEndpoint} ${projectId} ${apiKey} ${databaseId} ${collectionId} ${recordAmount} ${threading}`);

    let output = '';
    pythonProcess.stdout?.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr?.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.on('exit', (code) => {
      res.status(200).json({ output });
    });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}