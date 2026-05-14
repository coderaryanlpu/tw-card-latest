"use client"

import { motion } from "framer-motion"
import { Shield, Lock, Eye, Fingerprint } from "lucide-react"

const securityFeatures = [
  {
    icon: Shield,
    title: "256-bit Encryption",
    description: "Military-grade encryption protects every transaction and keeps your data secure."
  },
  {
    icon: Lock,
    title: "Instant Card Lock",
    description: "Lost your card? Lock it instantly from the app with a single tap."
  },
  {
    icon: Eye,
    title: "Fraud Monitoring",
    description: "AI-powered fraud detection monitors transactions 24/7 for suspicious activity."
  },
  {
    icon: Fingerprint,
    title: "Biometric Auth",
    description: "Use Face ID or fingerprint to authorize transactions and access your account."
  }
]

export function SecuritySection() {
  return (
    <section id="security" className="py-20 md:py-32 bg-slate-900 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full px-4 sm:px-6 lg:px-12 xl:px-16">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">Bank-Grade Security</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-balance">
            Your security is our{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              top priority
            </span>
          </h2>
          <p className="mt-4 text-lg text-slate-400 text-pretty">
            Built with the same security standards trusted by banks and financial institutions worldwide.
          </p>
        </motion.div>

        {/* Security Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {securityFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8"
        >
          <div className="text-center">
            <p className="text-4xl font-bold text-white">$10B+</p>
            <p className="text-sm text-slate-400 mt-1">Assets Protected</p>
          </div>
          <div className="w-px h-12 bg-white/20 hidden sm:block" />
          <div className="text-center">
            <p className="text-4xl font-bold text-white">10M+</p>
            <p className="text-sm text-slate-400 mt-1">Active Users</p>
          </div>
          <div className="w-px h-12 bg-white/20 hidden sm:block" />
          <div className="text-center">
            <p className="text-4xl font-bold text-white">0</p>
            <p className="text-sm text-slate-400 mt-1">Security Breaches</p>
          </div>
          <div className="w-px h-12 bg-white/20 hidden sm:block" />
          <div className="text-center">
            <p className="text-4xl font-bold text-white">24/7</p>
            <p className="text-sm text-slate-400 mt-1">Monitoring</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
