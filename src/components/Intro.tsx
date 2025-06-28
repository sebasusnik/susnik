import { useState, useEffect, useCallback, useRef } from 'react';
import SkillsList from './SkillsList';
import ProjectsList from './ProjectsList';
import Caret from './Caret';

const introLines = ["I am Sebastian Susnik", "and I like to build stuff..."];
const projectsCommand = 'projects';
const skillsCommand = 'skills';

type TypingState = {
    text: string;
    cursor: boolean;
};

const useTypingEffect = (textToType: string, speed = 50, onFinished?: () => void) => {
    const [state, setState] = useState<TypingState>({ text: '', cursor: false });
    const onFinishedRef = useRef(onFinished);
    onFinishedRef.current = onFinished;

    useEffect(() => {
        if (!textToType) {
            setState({ text: '', cursor: false });
            return;
        }

        setState({ text: '', cursor: true });

        const intervalId = setInterval(() => {
            setState(prevState => {
                if (prevState.text.length < textToType.length) {
                    return { text: textToType.substring(0, prevState.text.length + 1), cursor: true };
                }
                
                clearInterval(intervalId);
                if (onFinishedRef.current) onFinishedRef.current();
                return { ...prevState, cursor: false };
            });
        }, speed);

        return () => clearInterval(intervalId);
    }, [textToType, speed]);

    return state;
};

const AnimatedPrompt = ({ command, onFinished }: { command: string; onFinished: () => void; }) => {
    const typedCommand = useTypingEffect(command, 80, onFinished);

    return (
        <div className="flex items-center mb-1">
            <span className="text-fuchsia-400">sebasusnik@portfolio</span><span className="text-gray-500">:</span><span className="text-cyan-400">~</span><span className="text-gray-500">$</span>
            <span className="pl-2">
                <span className="text-green-400">{typedCommand.text}</span>
                {typedCommand.cursor && <Caret />}
            </span>
        </div>
    );
};

const StaticPrompt = ({ command }: { command: string }) => (
    <div className="flex items-center mb-1">
        <span className="text-fuchsia-400">sebasusnik@portfolio</span><span className="text-gray-500">:</span><span className="text-cyan-400">~</span><span className="text-gray-500">$</span>
        <span className="pl-2"><span className="text-green-400">{command}</span></span>
    </div>
);

const Intro = ({ onDone }: { onDone: () => void }) => {
    const [step, setStep] = useState(0);
    const doneRef = useRef(false);

    const advanceStep = useCallback(() => {
        setStep(s => s + 1);
    }, []);

    const skipIntro = useCallback(() => {
        if (doneRef.current) return;
        doneRef.current = true;
        setStep(10);
        setTimeout(onDone, 100);
    }, [onDone]);

    useEffect(() => {
        const keyHandler = (e: KeyboardEvent) => {
            if (doneRef.current) return;

            if (e.key.length === 1 || ["Enter", "Tab", "Escape", " "].includes(e.key)) {
                e.preventDefault();
                skipIntro();
            }
        };

        const pointerHandler = () => {
            if (doneRef.current) return;
            skipIntro();
        };

        window.addEventListener('keydown', keyHandler);
        window.addEventListener('mousedown', pointerHandler);
        window.addEventListener('touchstart', pointerHandler, { passive: true });

        return () => {
            window.removeEventListener('keydown', keyHandler);
            window.removeEventListener('mousedown', pointerHandler);
            window.removeEventListener('touchstart', pointerHandler);
        };
    }, [skipIntro]);

    const typedLine1 = useTypingEffect(step === 0 ? introLines[0] : '', 50, advanceStep);
    const typedLine2 = useTypingEffect(step === 1 ? introLines[1] : '', 50, advanceStep);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (step === 2 || step === 4 || step === 6 || step === 8) {
            timer = setTimeout(advanceStep, 500);
        } else if (step === 10) {
            if (!doneRef.current) {
                timer = setTimeout(() => {
                    doneRef.current = true;
                    onDone();
                }, 500);
            }
        }
        return () => clearTimeout(timer);
    }, [step, onDone, advanceStep]);

    return (
        <div>
            {/* Line 1 */}
            <div className="text-lg md:text-xl lg:text-2xl">
                <span>{step > 0 ? introLines[0] : typedLine1.text}</span>
                {step === 0 && typedLine1.cursor && <Caret />}
            </div>

            {/* Line 2 */}
            {step >= 1 && (
                <div className="text-lg md:text-xl lg:text-2xl mb-4">
                    <span>{step > 1 ? introLines[1] : typedLine2.text}</span>
                    {step === 1 && typedLine2.cursor && <Caret />}
                </div>
            )}

            {/* Projects */}
            {step >= 3 && (step === 3 ? <AnimatedPrompt command={projectsCommand} onFinished={advanceStep} /> : <StaticPrompt command={projectsCommand} />)}
            {step === 5 ? <ProjectsList animate onFinished={advanceStep} /> : (step > 5 && <ProjectsList />)}

            {/* Skills */}
            {step >= 7 && (step === 7 ? <AnimatedPrompt command={skillsCommand} onFinished={advanceStep} /> : <StaticPrompt command={skillsCommand} />)}
            {step === 9 ? <SkillsList animate onFinished={advanceStep} /> : (step > 9 && <SkillsList />)}
        </div>
    );
};

export default Intro; 