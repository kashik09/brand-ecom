export type DownloadToken = {
  token: string
  orderId: string
  productId: string
  filePath: string
  expiresAt: string   // ISO time
  remaining: number   // how many downloads left
}
