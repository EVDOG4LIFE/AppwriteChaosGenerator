"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SelectValue, SelectTrigger, SelectItem, SelectContent, Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

export default function Generator() {
  const [output, setOutput] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const result = await response.json();
      setOutput(result.output);
    } else {
      setOutput('An error occurred while processing your request.');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4 min-h-screen">

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
        <h1 className="text-2xl font-bold">Chaos Generator</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Populate data into your Appwrite instance for load testing and seeding test data.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="apiEndpoint">API Endpoint</Label>
            <Input id="apiEndpoint" name="apiEndpoint" placeholder="https://cloud.appwrite.io/v1" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="projectId">Project ID</Label>
            <Input id="projectId" name="projectId" placeholder="Enter your project ID" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="apiKey">Secret API Key</Label>
            <Input id="apiKey" name="apiKey" placeholder="Enter your secret API key" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="databaseId">Database ID</Label>
            <Input id="databaseId" name="databaseId" placeholder="Enter your database ID" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="collectionId">Collection ID</Label>
            <Input id="collectionId" name="collectionId" placeholder="Enter your collection ID" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="recordAmount">Amount of Records</Label>
            <Input id="recordAmount" name="recordAmount" placeholder="Enter amount of records to create" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="threading">Threading</Label>
            <Select name="threading" required>
              <SelectTrigger id="threading">
                <SelectValue placeholder="Select threading level" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button type="submit" className="mt-4 lg:mt-auto">Start Population</Button>
      </form>
      <ScrollArea className="flex-1 rounded-md border">
        <div className="flex h-full w-full flex-col p-4 text-sm bg-black text-green-400 font-mono">
          <h4 className="mb-4 text-lg font-medium leading-none">Terminal</h4>
          <div className="flex-1 overflow-auto">
            <pre className="mt-4 leading-7 whitespace-pre-wrap">{output}</pre>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}