import React from 'react';
import styles from './FestiveGroupsMarquee.module.css';

const groups = [
  "Ganesh Utsav Associations",
  "Housing Societies",
  "College Communities",
  "Corporate Teams",
  "Event Organizers",
  "Alumni Groups",
  "Social Clubs",
  "Festive Committees"
];

export const FestiveGroupsMarquee = () => {
  return (
    <section className={styles.section}>
      <div className={styles.marqueeContainer}>
        <div className={styles.marqueeTrack}>
          {/* Double array for infinite scroll illusion */}
          {[...groups, ...groups].map((group, index) => (
            <React.Fragment key={index}>
              <span className={styles.marqueeItem}>{group}</span>
              <span className={styles.separator}>✦</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};
