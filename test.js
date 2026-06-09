const test = async () => {
  console.log("Waiting for server to start...");
  for(let i=0; i<15; i++) {
    try {
      await fetch('http://localhost:3000');
      console.log("Server is up!");
      break;
    } catch(e) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  console.log("Sending test request...");
  try {
    const res = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Chanchal', email: 'chanchal@example.com', password: 'mypassword123' })
    });
    const text = await res.text();
    console.log('STATUS:', res.status);
    console.log('BODY:', text);
  } catch (error) {
    console.error("Test failed:", error);
  }
};
test();
