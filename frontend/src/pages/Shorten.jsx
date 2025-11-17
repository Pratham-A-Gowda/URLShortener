import React from "react";
import ShortenForm from "../ui/ShortenForm";

export default function Shorten() {
  return (
    <div className="container mx-auto max-w-2xl py-8">
      <h1 className="text-2xl font-semibold mb-4">Create a short link</h1>
      <ShortenForm />
    </div>
  );
}
