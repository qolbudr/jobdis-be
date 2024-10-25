import Lottie from 'lottie-jsx';
import * as animationData from '@/loader.json';

export const Loader = () => {
    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    };

    return <>
        <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'absolute', top: 0, left: 0, right:0, bottom: 0, backgroundColor: 'white', zIndex: 99999 }}>
            <Lottie options={defaultOptions}
                height={400}
                width={400} />
        </div>
    </>
}