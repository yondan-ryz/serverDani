const { minify: minifyHtml } = require('html-minifier-terser');
const CleanCSS = require('clean-css');
const { minify: minifyJs } = require('terser');

async function minifyService({ type, code } = {}) {
  const t = (type || '').toLowerCase();
  if (!code || String(code).trim() === '') {
    throw Object.assign(new Error('code is required'), { statusCode: 400 });
  }

  if (!t) throw Object.assign(new Error('type is required (html|css|js)'), { statusCode: 400 });

  if (t === 'html') {
    const result = await minifyHtml(String(code), {
      collapseWhitespace: true,
      removeComments: true,
      minifyCSS: true,
      minifyJS: true
    });
    return { minified: result };
  }

  if (t === 'css') {
    const result = new CleanCSS({}).minify(String(code));
    if (result.errors && result.errors.length) {
      throw Object.assign(new Error(result.errors.join('; ')), { statusCode: 400 });
    }
    return { minified: result.styles };
  }

  if (t === 'js' || t === 'javascript') {
    const result = await minifyJs(String(code), {
      compress: true,
      mangle: true,
      format: { comments: false }
    });
    if (result.error) throw Object.assign(result.error, { statusCode: 400 });
    return { minified: result.code };
  }

  throw Object.assign(new Error('Invalid type. Supported: html, css, js'), { statusCode: 400 });
}

module.exports = { minifyService };

