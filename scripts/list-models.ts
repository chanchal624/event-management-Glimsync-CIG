async function run() {
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + process.env.GEMINI_API_KEY);
  const data = await res.json();
  if (data.models) {
    console.log(data.models.map((m: any) => m.name).filter((m: string) => m.includes('gemini')));
  } else {
    console.log(data);
  }
}
run();
