// functions/api/github.js
export async function onRequest(context) {
  // 获取前端请求的路径和方法
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/github', ''); // 去除路径前缀
  
  // 构建请求目标：GitHub API
  const githubApiUrl = `https://api.github.com${path}`;
  
  // 从请求头中提取认证信息
  const authHeader = request.headers.get('Authorization');
  const acceptHeader = request.headers.get('Accept');
  
  // 构建新的请求头
  const headers = {
    'Accept': acceptHeader || 'application/json',
    'User-Agent': 'GitStars-Cloudflare',
  };
  
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }
  
  // 获取请求体（如果有）
  let body = null;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    body = await request.text();
  }
  
  // 向GitHub API发起请求
  try {
    const response = await fetch(githubApiUrl, {
      method: request.method,
      headers: headers,
      body: body,
    });
    
    // 处理响应
    const responseData = await response.text();
    const responseHeaders = {
      'Content-Type': response.headers.get('Content-Type') || 'application/json',
      'Access-Control-Allow-Origin': '*', // 允许跨域
    };
    
    return new Response(responseData, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('代理请求失败:', error);
    return new Response(JSON.stringify({ error: '代理请求失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
