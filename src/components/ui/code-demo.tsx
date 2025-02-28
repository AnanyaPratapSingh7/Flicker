import { ThreeDPhotoCarousel } from "../../components/ui/3d-carousel"
import { useState } from "react"
import { Button } from "../../components/ui/Button"
import { AgentLaunchpad } from "../../components/AgentLaunchpad/AgentLaunchpad"

export function ThreeDPhotoCarouselDemo() {
  const [demoType, setDemoType] = useState<'generic' | 'presale'>('presale')
  
  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-6 flex justify-center space-x-4">
        <Button 
          variant={demoType === 'generic' ? 'secondary' : 'outline'} 
          onClick={() => setDemoType('generic')}
          className={demoType === 'generic' ? "bg-[#D4C6A1]/20 hover:bg-[#D4C6A1]/30 text-[#D4C6A1] border border-[#D4C6A1]/30" : ""}
        >
          Generic 3D Carousel
        </Button>
        <Button 
          variant={demoType === 'presale' ? 'secondary' : 'outline'} 
          onClick={() => setDemoType('presale')}
          className={demoType === 'presale' ? "bg-[#D4C6A1]/20 hover:bg-[#D4C6A1]/30 text-[#D4C6A1] border border-[#D4C6A1]/30" : ""}
        >
          Presale Carousel
        </Button>
      </div>
      
      <div className="min-h-[500px] flex flex-col justify-center border border-dashed border-[#BFB28F]/30 rounded-lg p-4">
        {demoType === 'generic' ? (
          <div className="p-2">
            <h2 className="text-2xl font-bold mb-6 text-center text-white">Generic 3D Carousel</h2>
            <div className="h-[420px]">
              <ThreeDPhotoCarousel />
            </div>
          </div>
        ) : (
          <div className="p-2">
            <h2 className="text-2xl font-bold mb-6 text-center text-white">Agent Presale Carousel</h2>
            <AgentLaunchpad />
          </div>
        )}
      </div>
    </div>
  )
}
