export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  
  // Return complete attachment object with url, type, and name
  return {
    url: data.url,
    type: data.type,
    name: data.name,
    publicId: data.publicId,
  };
}
