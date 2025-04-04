"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import { ExperienceItem } from "@/components/experience-item";
import { GithubIcon } from "@/components/icons/github";
import { LinkedInIcon } from "@/components/icons/linkedin";
import { TwitterIcon } from "@/components/icons/twitter";
import { SkillCard } from "@/components/skill-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
    return (
        <div className="flex min-h-screen flex-col">
            {/* Navbar Section */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between">
                    <Link
                        href="/"
                        className="flex items-center gap-2 font-bold"
                    >
                        <span className="text-xl">Sharvin Shah</span>
                    </Link>
                    <nav className="hidden md:flex gap-6">
                        <Link
                            href="#about"
                            className="text-md font-medium hover:underline underline-offset-4"
                        >
                            About
                        </Link>
                        <Link
                            href="#experience"
                            className="text-md font-medium hover:underline underline-offset-4"
                        >
                            Experience
                        </Link>
                        <Link
                            href="#skills"
                            className="text-md font-medium hover:underline underline-offset-4"
                        >
                            Skills
                        </Link>
                        <Link
                            href="#hobbies"
                            className="text-md font-medium hover:underline underline-offset-4"
                        >
                            Hobbies
                        </Link>
                        <Link
                            href="https://www.mtechzilla.com/blog"
                            className="text-md font-medium hover:underline underline-offset-4"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Blogs
                        </Link>
                    </nav>
                    <div className="flex gap-4">
                        <Link
                            href="https://x.com/sharvinshah26"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button variant="ghost" size="icon">
                                <TwitterIcon className="h-6 w-6" />
                                <span className="sr-only">Twitter</span>
                            </Button>
                        </Link>
                        <Link
                            href="https://www.linkedin.com/in/sharvinshah/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button variant="ghost" size="icon">
                                <LinkedInIcon className="h-6 w-6" />
                                <span className="sr-only">LinkedIn</span>
                            </Button>
                        </Link>
                        <Link
                            href="https://github.com/Sharvin26"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button variant="ghost" size="icon">
                                <GithubIcon className="h-6 w-6" />
                                <span className="sr-only">Github</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="py-20 md:py-32">
                    <div className="container mx-auto px-4 sm:px-6 md:px-8">
                        <div className="grid gap-10 md:gap-16 lg:grid-cols-2 items-center">
                            {/* Text Block */}
                            <motion.div
                                className="space-y-5 text-center lg:text-left"
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                            >
                                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                                    Engineer by Passion and Choice.
                                </h1>
                                <Link
                                    href="https://www.mtechzilla.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <p className="text-muted-foreground text-lg">
                                        Founder @{" "}
                                        <span className="underline">
                                            MTechZilla
                                        </span>
                                    </p>
                                </Link>

                                <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto lg:mx-0">
                                    I&apos;m a passionate developer and founder
                                    leading MTechZilla, a software development
                                    agency specializing in AI, web and mobile
                                    applications. I enjoy building innovative
                                    solutions and sharing knowledge with the
                                    tech community.
                                </p>
                            </motion.div>

                            {/* Image Block */}
                            <motion.div
                                className="flex justify-center"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{
                                    duration: 0.6,
                                    delay: 0.3,
                                    ease: "easeOut",
                                }}
                            >
                                <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-full overflow-hidden border shadow-lg">
                                    <Image
                                        src="/sharvin.png"
                                        alt="Sharvin Shah"
                                        width={320}
                                        height={320}
                                        className="w-full h-full object-cover object-top"
                                        priority
                                    />
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* About Section */}
                <section
                    id="about"
                    className="py-12 md:py-16 lg:py-20 bg-muted/50"
                >
                    <div className="container px-4 md:px-6">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center"
                        >
                            <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
                                About Me
                            </h2>
                            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                                I&apos;m Sharvin Shah, a software engineer and
                                entrepreneur based in India. As the Founder and
                                CEO of MTechZilla, I lead a dedicated team of
                                developers and designers to deliver innovative
                                web and mobile solutions tailored to our
                                clients&apos; needs. Our mission is to transform
                                ideas into impactful digital products that drive
                                success.
                            </p>
                            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7 mt-4">
                                With over a decade of experience in the tech
                                industry, I&apos;ve witnessed and contributed to
                                the rapid evolution of web and mobile
                                technologies. I firmly believe in their power to
                                solve real-world problems and enhance everyday
                                life. My journey has been driven by a passion
                                for creating user-centric applications that not
                                only meet business objectives but also provide
                                exceptional user experiences.
                            </p>
                            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7 mt-4">
                                ​Outside of work, I enjoy Marvel comics and
                                watching engaging TV series, which offer a fun
                                break and spark new ideas for my projects. I
                                also love traveling to experience different
                                cultures and broaden my view of the world. In my
                                free time, playing computer games is a favorite
                                pastime that keeps me entertained and connected
                                with the latest in interactive technology.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Professional Experience Section */}
                <section id="experience" className="py-12 md:py-16 lg:py-20">
                    <div className="container px-4 md:px-6">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center"
                        >
                            {" "}
                            <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
                                Professional Experience
                            </h2>
                            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                                A look into my career journey—from building APIs
                                and IoT systems to founding and growing a tech
                                agency.
                            </p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="mx-auto max-w-3xl mt-8"
                        >
                            <ExperienceItem
                                title="Founder & CEO"
                                company="MTechZilla"
                                period="Feb 2021 – Present"
                                description="Started MTechZilla to help startups and businesses turn their product ideas into real, working software. I lead a growing team of developers and designers. We build full-stack apps, mobile apps, SaaS platforms, and tools for startups across different industries."
                            />
                            <ExperienceItem
                                title="Contributor"
                                company="freeCodeCamp"
                                period="May 2020 – Present"
                                description="I write articles on web development and SaaS for freeCodeCamp. It's a way for me to share what I’ve learned and give back to the tech community. My posts focus on practical tips, real-world examples, and lessons from my own projects."
                            />
                            <ExperienceItem
                                title="Software Developer"
                                company="KPlay Team"
                                period="Jul 2020 – Jan 2021"
                                description="Built and managed REST APIs using Express.js, Node.js, and MongoDB. Worked closely with the frontend team to create smooth experiences for end users. Gained hands-on experience in backend performance, security, and integration."
                            />
                            <ExperienceItem
                                title="Software Developer"
                                company="Phynart"
                                period="Oct 2018 – Mar 2020"
                                description="Worked on IoT and cloud infrastructure. I was responsible for building backend services, managing device data, and creating secure APIs. I also developed a system for Over-the-Air (OTA) updates for smart devices, making it easy to deploy software updates without manual steps."
                            />
                        </motion.div>
                    </div>
                </section>

                {/* Skills & Expertise Section */}
                <section
                    id="skills"
                    className="py-12 md:py-16 lg:py-20 bg-muted/50"
                >
                    <div className="container px-4 md:px-6">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center"
                        >
                            <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
                                Skills & Expertise
                            </h2>
                            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                                Technologies and methodologies I&apos;ve
                                mastered throughout my career.
                            </p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3 lg:gap-8 mt-8"
                        >
                            {" "}
                            <SkillCard
                                title="Frontend Development"
                                skills={[
                                    "React",
                                    "Next.js",
                                    "TypeScript",
                                    "Tailwind CSS",
                                ]}
                            />
                            <SkillCard
                                title="Backend Development"
                                skills={["Node.js", "Express", "AI"]}
                            />
                            <SkillCard
                                title="Mobile Development"
                                skills={["React Native", "Flutter"]}
                            />
                            <SkillCard
                                title="Databases"
                                skills={[
                                    "MongoDB",
                                    "PostgreSQL",
                                    "MySQL",
                                    "Redis",
                                    "Supabase",
                                ]}
                            />
                            <SkillCard
                                title="DevOps"
                                skills={[
                                    "Docker",
                                    "Kubernetes",
                                    "AWS",
                                    "CI/CD",
                                    "Terraform",
                                ]}
                            />
                            <SkillCard
                                title="Other Skills"
                                skills={[
                                    "UI/UX Design",
                                    "Project Management",
                                    "Team Leadership",
                                    "Technical Writing",
                                ]}
                            />
                        </motion.div>
                    </div>
                </section>

                {/* Hobbies & Interests Section */}
                <section id="hobbies" className="py-12 md:py-16 lg:py-20">
                    <div className="container px-4 md:px-6">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center"
                        >
                            <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
                                Hobbies & Interests
                            </h2>
                            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                                Outside of tech, I enjoy things that help me
                                relax, stay creative, and explore new ideas.
                            </p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="mx-auto max-w-3xl mt-8 grid gap-6 sm:grid-cols-2"
                        >
                            <Card>
                                <CardContent className="p-6">
                                    <h3 className="text-xl font-bold mb-2">
                                        Marvel & TV Shows
                                    </h3>
                                    <p className="text-muted-foreground">
                                        I&apos;m a big fan of Marvel comics and
                                        love watching good TV shows. They give
                                        me a break from work and often spark
                                        ideas in unexpected ways.
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-6">
                                    <h3 className="text-xl font-bold mb-2">
                                        Traveling
                                    </h3>
                                    <p className="text-muted-foreground">
                                        I enjoy traveling to new places and
                                        exploring different cultures. It helps
                                        me see things differently and stay
                                        curious.
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-6">
                                    <h3 className="text-xl font-bold mb-2">
                                        Gaming
                                    </h3>
                                    <p className="text-muted-foreground">
                                        I love playing computer games in my free
                                        time. It’s fun, relaxing, and keeps me
                                        connected with the latest in digital
                                        experiences.
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-6">
                                    <h3 className="text-xl font-bold mb-2">
                                        Writing & Sharing
                                    </h3>
                                    <p className="text-muted-foreground">
                                        I write articles on MTechZilla and freeCodeCamp website to
                                        share what I learn. It’s a great way to
                                        give back and connect with other
                                        developers.
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </section>
            </main>

            {/* Footer Section */}
            <footer className="border-t py-6 md:py-8">
                <div className="container flex flex-col items-center justify-center gap-4 text-center md:flex-row md:justify-between md:text-left">
                    <div className="flex flex-col gap-1">
                        <p className="text-sm text-muted-foreground">
                            © {new Date().getFullYear()} Sharvin Shah. All
                            rights reserved.
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Founder of{" "}
                        <Link
                            href="https://www.mtechzilla.com/"
                            className="underline underline-offset-4"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            MTechZilla
                        </Link>
                    </p>
                </div>
            </footer>
        </div>
    );
}
