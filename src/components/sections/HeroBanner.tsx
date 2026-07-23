import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { stats } from "@/data/stats";

export function HeroBanner() {
  return (
    <section
      id="main-content"
      className="relative flex min-h-[720px] items-center overflow-hidden bg-primary"
    >
      {/* Background placeholder fills the hero; content sits above it */}
      <div className="absolute inset-0">
        <ImagePlaceholder
          alt="Hero photograph of the JOLNHS campus and students"
          label="Insert Hero Image Here"
          recommendedSize="1920 x 1080"
          className="h-full min-h-[720px] rounded-none border-none bg-primary-600/60 text-blue-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/70 to-primary/30" />
      </div>

      <Container className="relative z-10 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <p className="mb-4 text-small font-semibold uppercase tracking-widest text-blue-200">
            Julia Ortiz Luis National High School
          </p>
          <h1 className="text-hero text-white">
            Molding Minds. <br />Building Futures.
          </h1>
          <p className="mt-6 text-body text-blue-100">
            Welcome to JOLNHS — a public high school committed to quality,
            inclusive, and community-centered education for every learner.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button variant="secondary" href="/enroll">
              Enroll Now
            </Button>
            <Button variant="outline" href="/about">
              Learn More
            </Button>
          </div>
        </motion.div>

        {/* Quick statistics strip */}
        <motion.dl
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="mt-16 grid grid-cols-2 gap-6 border-t border-white/20 pt-8 sm:grid-cols-4"
        >
          {stats.map((stat) => (
            <div key={stat.id}>
              <dt className="text-small font-medium text-blue-200">
                {stat.label}
              </dt>
              <dd className="mt-1 text-subtitle text-white">
                {stat.value.toLocaleString()}
                {stat.suffix}
              </dd>
            </div>
          ))}
        </motion.dl>
      </Container>
    </section>
  );
}
