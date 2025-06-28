import { useState, useEffect, useCallback, useRef } from 'react';
import SkillsList from './SkillsList';
import ProjectsList from './ProjectsList';

// Data for the animations
const projects = [
    { title: 'Project: E-commerce Platform', status: 'DONE', description: 'Engineered a complete, scalable e-commerce platform using a MERN stack.' },
    { title: 'Project: Real-time Chat App', status: 'DONE', description: 'Built a responsive, real-time chat application with WebSockets and Vue.js.' },
    { title: 'Hobby: Open Source Contribution', status: 'ACTIVE', description: 'Regular contributor to open-source projects, focusing on bug fixes and new features.' }
];
const skills = ['JavaScript (ES6+)', 'React', 'Vue.js', 'Node.js', 'Express', 'HTML5 & CSS3', 'Tailwind CSS', 'SQL (PostgreSQL)', 'NoSQL (MongoDB)', 'AWS (EC2, S3)', 'Docker', 'Git & GitHub', 'CI/CD', 'REST APIs'];

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
                {typedCommand.cursor && <span className="inline-block w-[10px] h-[1.2rem] align-middle bg-white animate-cursor" />}
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

const AnimatedProjectsList = ({ onFinished }: { onFinished: () => void }) => {
    const [renderedProjects, setRenderedProjects] = useState<typeof projects>([]);
    const onFinishedRef = useRef(onFinished);
    onFinishedRef.current = onFinished;

    useEffect(() => {
        const interval = setInterval(() => {
            setRenderedProjects(prev => {
                if (prev.length < projects.length) {
                    return [...prev, projects[prev.length]];
                }
                clearInterval(interval);
                setTimeout(() => onFinishedRef.current(), 200);
                return prev;
            });
        }, 150);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="mt-2 mb-4">
            <div className="text-cyan-400 mb-4 text-base">Running: "{projectsCommand}"...</div>
            {renderedProjects.map(proj => {
                const statusColor = proj.status === 'DONE' ? 'text-green-400' : 'text-yellow-400';
                return (
                    <div key={proj.title} className="text-sm md:text-base mb-6">
                        <div className="flex items-center">
                            <span className="text-white font-bold">{proj.title}</span>
                            <span className="ml-4">[<span className={`${statusColor} font-bold`}>{proj.status}</span>]</span>
                        </div>
                        <p className="text-gray-400 mt-1 pl-2">{proj.description}</p>
                    </div>
                )
            })}
        </div>
    );
};

const StaticProjectsList = () => (
    <div className="mt-2 mb-4">
        <div className="text-cyan-400 mb-4 text-base">Running: "{projectsCommand}"...</div>
        {projects.map(proj => {
            const statusColor = proj.status === 'DONE' ? 'text-green-400' : 'text-yellow-400';
            return (
                <div key={proj.title} className="text-sm md:text-base mb-6">
                    <div className="flex items-center">
                        <span className="text-white font-bold">{proj.title}</span>
                        <span className="ml-4">[<span className={`${statusColor} font-bold`}>{proj.status}</span>]</span>
                    </div>
                    <p className="text-gray-400 mt-1 pl-2">{proj.description}</p>
                </div>
            )
        })}
    </div>
);

const AnimatedSkillsList = ({ onFinished }: { onFinished: () => void }) => {
    const [renderedSkills, setRenderedSkills] = useState<typeof skills>([]);
    const onFinishedRef = useRef(onFinished);
    onFinishedRef.current = onFinished;

    useEffect(() => {
        const interval = setInterval(() => {
            setRenderedSkills(prev => {
                if (prev.length < skills.length) {
                    return [...prev, skills[prev.length]];
                }
                clearInterval(interval);
                setTimeout(() => onFinishedRef.current(), 200);
                return prev;
            });
        }, 35);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="mt-2 mb-4">
            <div className="text-cyan-400 mb-4 text-base">Running: "{skillsCommand}"...</div>
            <h3 className="text-lg text-cyan-400 font-bold mb-2">Core Competencies:</h3>
            <ul className="flex flex-wrap gap-x-8 gap-y-2 pl-2">
                {renderedSkills.map(skill => <li key={skill} className="text-white">- {skill}</li>)}
            </ul>
        </div>
    );
};

const StaticSkillsList = () => (
    <div className="mt-2 mb-4">
        <div className="text-cyan-400 mb-4 text-base">Running: "{skillsCommand}"...</div>
        <h3 className="text-lg text-cyan-400 font-bold mb-2">Core Competencies:</h3>
        <ul className="flex flex-wrap gap-x-8 gap-y-2 pl-2">
            {skills.map(skill => <li key={skill} className="text-white">- {skill}</li>)}
        </ul>
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
        // Ensure content is rendered before signalling done
        setTimeout(onDone, 100);
    }, [onDone]);

    // Listen for Enter or Tab to skip
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                skipIntro();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
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
                {step === 0 && typedLine1.cursor && <span className="inline-block w-[10px] h-[1.2rem] align-middle bg-white animate-cursor" />}
            </div>

            {/* Line 2 */}
            {step >= 1 && (
                <div className="text-lg md:text-xl lg:text-2xl mb-4">
                    <span>{step > 1 ? introLines[1] : typedLine2.text}</span>
                    {step === 1 && typedLine2.cursor && <span className="inline-block w-[10px] h-[1.2rem] align-middle bg-white animate-cursor" />}
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