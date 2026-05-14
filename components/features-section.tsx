"use client"

import { motion } from "framer-motion"
import { 
  Zap, 
  Percent, 
  Globe, 
  Shield, 
  CreditCard, 
  Smartphone 
} from "lucide-react"

const features = [
  {
    icon: Percent,
    title: "0% Fees",
    description: "No hidden charges. No transaction fees. Keep more of your crypto with every purchase.",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: Zap,
    title: "2% Cashback",
    description: "Earn rewards on every transaction. Get cashback directly to your Trust Wallet.",
    gradient: "from-cyan-500 to-teal-500"
  },
  {
    icon: Globe,
    title: "Global Acceptance",
    description: "Spend anywhere Visa or Mastercard is accepted. Over 80 million merchants worldwide.",
    gradient: "from-blue-600 to-blue-500"
  },
  {
    icon: Shield,
    title: "Bank-Grade Security",
    description: "Enterprise-level encryption and fraud protection. Your funds are always safe.",
    gradient: "from-blue-500 to-indigo-500"
  },
  {
    icon: CreditCard,
    title: "Visa & Mastercard",
    description: "Compatible with global payment infrastructure. Use it like any traditional card.",
    gradient: "from-indigo-500 to-blue-500"
  },
  {
    icon: Smartphone,
    title: "Instant Spending",
    description: "Convert and spend crypto instantly. No waiting periods or complex processes.",
    gradient: "from-cyan-500 to-blue-500"
  }
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-32 bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 text-balance">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              spend crypto freely
            </span>
          </h2>
          <p className="mt-4 text-lg text-slate-600 text-pretty">
            TrustCard combines the power of your crypto wallet with the convenience of traditional payments.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group relative bg-slate-50 hover:bg-white rounded-3xl p-8 transition-all duration-300 hover:shadow-xl hover:shadow-blue-100/50 border border-transparent hover:border-blue-100"
            >
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-lg mb-6`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
