import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import Head from 'next/head';

const CameraDetection = () => {
  const videoRef = useRef();
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [matchedFileName, setMatchedFileName] = useState(null);
  const [inputText, setInputText] = useState('');
  const [typedText, setTypedText] = useState('');
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    const loadModels = async () => {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
      ]);
    };

    const loadLabeledImages = async () => {
      const labeledImages = [
        { fileName: '-036901', filePath: '/images/-036901.jpg' },
        { fileName: '-038720', filePath: '/images/-038720.jpg' },
        { fileName: '-039125', filePath: '/images/-039125.jpg' },
        { fileName: '-039951', filePath: '/images/-039951.jpg' },
        { fileName: '-039994', filePath: '/images/-039994.jpg' },
        { fileName: '-200119', filePath: '/images/-200119.jpg' },
        { fileName: '-200151', filePath: '/images/-200151.jpg' },
        { fileName: '-200399', filePath: '/images/-200399.jpg' },
        { fileName: '-200431', filePath: '/images/-200431.jpg' },
        { fileName: '-200477', filePath: '/images/-200477.jpg' },
        { fileName: '-200514', filePath: '/images/-200514.jpg' },
        { fileName: '-200539', filePath: '/images/-200539.jpg' },
        { fileName: '-200546', filePath: '/images/-200546.jpg' },
        { fileName: '-200550', filePath: '/images/-200550.jpg' },
        { fileName: '-200551', filePath: '/images/-200551.jpg' },
        { fileName: '-200552', filePath: '/images/-200552.jpg' },
        { fileName: '-PKL136', filePath: '/images/-PKL136.jpg' },
        { fileName: '-PKL80', filePath: '/images/-PKL80.jpg' },
        { fileName: '-PKL204', filePath: '/images/-PKL204.jpg' },
        { fileName: '-PKL206', filePath: '/images/-PKL206.jpg' },
        { fileName: '-PKL200', filePath: '/images/-PKL200.jpg' },
      ];

      const labeledDescriptors = await Promise.all(
        labeledImages.map(async (img) => {
          const imgElement = await faceapi.fetchImage(img.filePath);
          const fullFaceDescription = await faceapi.detectSingleFace(imgElement).withFaceLandmarks().withFaceDescriptor();
          if (!fullFaceDescription) {
            throw new Error(`No face detected for image: ${img.filePath}`);
          }
          return {
            fileName: img.fileName,
            descriptor: fullFaceDescription.descriptor
          };
        })
      );

      return labeledDescriptors.map(ld => ({
        label: ld.fileName,
        descriptor: ld.descriptor
      }));
    };

    const startCamera = async () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          videoRef.current.addEventListener('loadedmetadata', () => {
            setIsVideoLoaded(true);
          });

          videoRef.current.addEventListener('play', async () => {
            const labeledDescriptors = await loadLabeledImages();
            const faceMatcher = new faceapi.FaceMatcher(
              labeledDescriptors.map(ld => new faceapi.LabeledFaceDescriptors(ld.label, [ld.descriptor]))
            );

            setInterval(async () => {
              if (isVideoLoaded) {
                const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.SsdMobilenetv1Options())
                  .withFaceLandmarks()
                  .withFaceDescriptors();

                if (detections.length > 0) {
                  const bestMatch = faceMatcher.findBestMatch(detections[0].descriptor);
                  setMatchedFileName(bestMatch.label);
                }
              }
            }, 100);
          });
        }
      }
    };

    loadModels();
    startCamera();
  }, [isVideoLoaded]);

  useEffect(() => {
    const originalText = "Muka";
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= originalText.length) {
        setTypedText(originalText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setTyping(false);
        }, 1000);
      }
    }, 300);

    return () => clearInterval(interval);
  }, [typing]);

  useEffect(() => {
    if (!typing) {
      setTypedText('');
      setTyping(true);
    }
  }, [typing]);

  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <Head>
        <title>Cek Muka</title>
        <meta name="description" content="Cek Muka" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center flex-grow">
        <h1 className="text-4xl mb-4 mt-8 font-bold text-center ">Cek <span className='text-blue-400'> {typedText}</span></h1>
        <div className="w-full max-w-xl p-8 bg-gray-800 rounded-3xl shadow-md transform transition duration-500 hover:scale-105">
        <div className="relative w-full max-w-lg">
            <video ref={videoRef} className="w-full rounded-lg shadow-lg" autoPlay muted playsInline />
            {matchedFileName && (
            <div className="absolute inset-x-0 bottom-0 px-4 py-6 bg-gray-800 bg-opacity-75 rounded-b-lg">
                <p className="text-xl font-bold mb-2">Badge:</p>
                <p className="text-3xl">{matchedFileName == "unknown" ? "hmm .. 🤔" : matchedFileName.replace("-", "")}</p>
            </div>
            )}
        </div>
        </div>
      </main>
    </div>
  );
};

export default CameraDetection;
