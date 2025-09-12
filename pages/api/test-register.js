// Test register API endpoint
export default async function handler(req, res) {
  console.log('Test register endpoint hit');
  
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    console.log('Request body:', req.body);
    
    // Test basic response
    return res.status(200).json({
      ok: true,
      message: "Test endpoint working",
      body: req.body
    });
  } catch (error) {
    console.error('Test register error:', error);
    return res.status(500).json({ 
      ok: false, 
      error: "Test error",
      details: error.message
    });
  }
}