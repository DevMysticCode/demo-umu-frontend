// composables/useWelcomePageData.ts

import { onMounted, ref } from "vue"

export interface WelcomeSlide {
  id: number
  title: string
  description: string
}

const SLIDES_DATA: WelcomeSlide[] = [
  {
    id: 1,
    title: "Your data. Your money.\nYour move. Your way.",
    description: "Experience seamless service with our app! Each time you hire a verified tradesperson, you automatically accumulate reward points. Enjoy the benefits of your loyalty with every booking, making your home improvement projects even more rewarding.",
  },
  {
    id: 2,
    title: "Moving's never been so simple.",
    description: "Your complete property toolkit—track progress, store documents, and connect with trusted trades in one place.",
  },
  {
    id: 3,
    title: "Tired of time consuming transactions. Join the club.",
    description: "Your complete property toolkit—track progress, store documents, and connect with trusted trades in one place.",
  },
  {
    id: 4,
    title: "Your next move, in the palm of your hands.",
    description: "Know what's next at every stage—get clear guidance and stay in control of your home journey.",
  },
  {
    id: 5,
    title: "Start building your property passport today, for an easier move tomorrow.",
    description: "Your complete property toolkit—track progress, store documents, and connect with trusted trades in one place.",
  },
  {
    id: 6,
    title: "Knowledge is power. Learn what slows your move down today.",
    description: "Know what's next at every stage—get clear guidance and stay in control of your home journey.",
  }
]

export const useWelcomePageData = () => {
  const slides = ref<WelcomeSlide[]>([])

  const loadSlides = async () => {
    slides.value = SLIDES_DATA
  }

  onMounted(loadSlides);

  return {
    slides,
    loadSlides,
  }
}