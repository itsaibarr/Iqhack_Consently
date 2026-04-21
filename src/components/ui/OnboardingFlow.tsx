"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Radar, AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(1);
  const [isScanning, setIsScanning] = useState(false);

  const nextStep = () => {
    if (step === 1) {
      setIsScanning(true);
      setTimeout(() => {
        setIsScanning(false);
        setStep(2);
      }, 3000);
    } else if (step === 2) {
      setStep(3);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Dynamic Background Blur */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-white/40 backdrop-blur-md dark:bg-black/40"
      />

      <AnimatePresence mode="wait">
        {step === 1 && !isScanning && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-md overflow-hidden rounded-[24px] border border-neutral-100 bg-white p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-500 dark:bg-blue-900/30">
              <Shield className="h-8 w-8" />
            </div>
            <h2 className="mb-3 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Take back control of your data.
            </h2>
            <p className="mb-8 text-neutral-600 dark:text-neutral-400">
              Consently shows you every service that has your personal information — and lets you take it back in one tap.
            </p>
            <button
              onClick={nextStep}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3B6BF5] py-4 font-semibold text-white transition-all hover:bg-blue-600 active:scale-[0.98]"
            >
              Scan my connections <ArrowRight className="h-5 w-5" />
            </button>
          </motion.div>
        )}

        {isScanning && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative flex flex-col items-center text-center"
          >
            <div className="relative mb-8 h-48 w-48">
              {/* Radar Animation */}
              <motion.div 
                animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                className="absolute inset-0 rounded-full border-2 border-blue-500/30"
              />
              <motion.div 
                animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeOut", delay: 0.5 }}
                className="absolute inset-0 rounded-full border-2 border-blue-500/20"
              />
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white dark:bg-neutral-900 shadow-xl border border-neutral-100 dark:border-neutral-800">
                <Radar className="h-12 w-12 text-[#3B6BF5] animate-pulse" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Mapping your data web...</h2>
            <p className="text-neutral-500">Connecting to extension sensors</p>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="relative w-full max-w-md overflow-hidden rounded-[24px] border border-neutral-100 bg-white p-8 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="mb-6 flex gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
            <h2 className="mb-2 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              We found 50 services.
            </h2>
            <div className="mb-8 space-y-4">
              <p className="text-neutral-600 dark:text-neutral-400">
                Our analysis shows that <span className="font-bold text-red-500">12 services</span> are accessing sensitive information without your explicit permission.
              </p>
              <div className="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800/50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">Privacy Health Score</span>
                  <span className="font-bold text-orange-500">74/100</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "74%" }}
                    className="h-full bg-orange-500"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={nextStep}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3B6BF5] py-4 font-semibold text-white transition-all hover:bg-blue-600"
            >
              Show me which ones <ArrowRight className="h-5 w-5" />
            </button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-lg overflow-hidden rounded-[24px] border border-red-100 bg-white p-8 shadow-2xl dark:border-red-900/20 dark:bg-neutral-900"
          >
             <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/40">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h2 className="mb-3 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Critical Finding: TikTok
            </h2>
            <p className="mb-6 text-neutral-600 dark:text-neutral-400">
              TikTok is reading your <span className="font-bold text-red-500">clipboard data</span> every time you open the app. This includes passwords, private messages, and links you&apos;ve copied.
            </p>
            <div className="mb-8 overflow-hidden rounded-xl border border-neutral-100 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800/30">
              <div className="flex items-center gap-4 p-4">
                <div className="h-10 w-10 flex-shrink-0 animate-pulse rounded-lg bg-red-500/20" />
                <div className="flex-1 space-y-2">
                  <div className="h-2 w-24 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                  <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800" />
                </div>
              </div>
            </div>
            <button
              onClick={nextStep}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-neutral-900 py-4 font-semibold text-white transition-all hover:bg-black dark:bg-white dark:text-black"
            >
              <span className="relative z-10 flex items-center gap-2">
                Enter Dashboard <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
              <motion.div 
                animate={{ x: ["-100%", "100%"] }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
