import * as jose from 'jose';

// 認証トークンの署名・検証に使う秘密鍵を.envファイルから読み込む
const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY);
const alg = 'HS256'; // アルゴリズムはHS256を使用

/**
 * ユーザー情報（ペイロード）を受け取り、署名済みのJWTを生成する
 * @param payload { sub: userId, email: userEmail }
 * @returns 署名済みJWT文字列
 */
export async function signJwt(payload: { sub: string; email: string }) {
  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('24h') // 有効期限は24時間
    .sign(secret);
}

/**
 * JWT文字列を受け取り、その正当性を検証する
 * @param token JWT文字列
 * @returns 検証に成功した場合はペイロード、失敗した場合はnull
 */
export async function verifyJwt(token: string) {
  try {
    const { payload } = await jose.jwtVerify(token, secret);
    return payload;
  } catch (e) {
    // トークンが無効または期限切れの場合
    return null;
  }
}