"use client"

import { motion } from "framer-motion"
import { CryptoCard } from "./crypto-card"
import Image from "next/image"

const floatingCoins = [
  {
    name: "TRON",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-8oLq60FRYbWuv6qkqSElhzxc2aT6MD.png",
    size: 80,
    position: { top: "10%", left: "5%" },
    delay: 0,
  },
  {
    name: "BNB",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-xK7uKGeN790EkokjD7l578tNdUsUgL.png",
    size: 75,
    position: { top: "20%", left: "15%" },
    delay: 0.5,
  },
  {
    name: "USDT",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-dTdTYLxhQ2271Vl0PNL4oH8iYhTzl7.png",
    size: 80,
    position: { top: "60%", left: "8%" },
    delay: 1,
  },
  {
    name: "ETH",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Lbb48urfl2ptnLnXudnzCfNXrucnq3.png",
    size: 60,
    position: { top: "75%", left: "20%" },
    delay: 1.5,
  },
  {
    name: "USDC",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-hWJy5RQmpl05cH6FF2gkizbtbPa6n2.png",
    size: 60,
    position: { top: "40%", left: "3%" },
    delay: 2,
  },
  {
    name: "TON",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-ec2gJYQ3Ggn5G0ZTXYuttOtCll3Jho.png",
    size: 70,
    position: { top: "5%", left: "25%" },
    delay: 2.5,
  },
]

export function MobileAppSection() {
  return (
    <section id="crypto" className="pt-16 pb-24 md:pt-24 lg:pt-12 bg-gradient-to-b from-white to-slate-50 overflow-hidden">
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left Content */}
          <motion.div
            className="flex-1 text-center lg:text-left"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              All Crypto
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                {" "}Supported
              </span>
            </h2>
            <p className="text-xl text-slate-600 mb-8 max-w-lg mx-auto lg:mx-0">
              Spend directly from your wallet using any of your favorite cryptocurrencies.
              Seamless conversion at the best rates.
            </p>

            {/* Supported Coins Row */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8">
              {floatingCoins.map((coin) => (
                <motion.div
                  key={coin.name}
                  className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md"
                  whileHover={{ scale: 1.05 }}
                >
                  <Image
                    src={coin.image}
                    alt={coin.name}
                    width={24}
                    height={24}
                    className="rounded-full"
                    unoptimized
                  />
                  <span className="text-sm font-medium text-slate-700">{coin.name}</span>
                </motion.div>
              ))}
            </div>

            <p className="text-slate-500">
              + 100 more cryptocurrencies supported
            </p>
          </motion.div>

          {/* Right Side - Card with Floating Coins */}
          <div className="flex-1 relative min-h-[500px] w-full flex items-center justify-center">
            {/* Floating Crypto Coins */}
            {floatingCoins.map((coin, index) => (
              <motion.div
                key={coin.name}
                className="absolute z-10"
                style={{
                  top: coin.position.top,
                  left: coin.position.left,
                }}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: coin.delay, duration: 0.5 }}
                animate={{
                  y: [0, -15, 0],
                }}
                // @ts-expect-error - framer-motion transition type
                transition={{
                  y: {
                    duration: 3 + index * 0.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }}
              >
                <Image
                  src={coin.image}
                  alt={coin.name}
                  width={coin.size}
                  height={coin.size}
                  className="drop-shadow-2xl"
                  unoptimized
                />
              </motion.div>
            ))}

            {/* Credit Card */}
            <motion.div
              className="relative z-20 lg:scale-[1.2] xl:scale-[1.3]"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <CryptoCard />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
