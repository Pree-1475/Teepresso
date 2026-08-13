import React from 'react';
import styles from './IndustriesSection.module.css';

const industries = [
  'Universities',
  'Corporate Teams',
  'Startups & Tech',
  'Event Organizers',
  'Sports Clubs',
  'Restaurants & Cafes',
  'Hotels & Resorts',
  'Colleges & Schools',
  'NGOs & Communities'
];



const marqueeIndustries = [...industries, ...industries, ...industries];

export function IndustriesSection() {
  return (
    <section className={styles.section}>
      <div className={`container ${styles.container}`}>
        <div className={styles.header}>
          <span className={styles.subtitle}>WHO WE SERVE</span>
          <h2 className={styles.title}>Tailored for every team.</h2>
          <p className={styles.description}>
            From Fortune 500 corporate offices to local sports clubs, we provide specialized bulk printing solutions tailored to the unique needs of your organization.
          </p>
        </div>
        
        <div className={styles.ropeContainer}>
          <div className={styles.mainRope}></div>
          <div className={styles.marqueeViewport}>
            <div className={styles.hangingItems}>
              {marqueeIndustries.map((industry, index) => (
                <div key={index} className={styles.hangingItem}>
                  <div className={styles.pill}>
                    {industry}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
