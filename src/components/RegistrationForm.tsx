import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePaystackPayment } from 'react-paystack';
import {
  User,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  Users,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  UserCheck
} from 'lucide-react';
import { Candidate, NameFields } from '../types';
import { db, auth, storage } from '../firebase';
import { sendEmail, emailTemplates } from '../services/emailService';
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const STEPS = [
  { id: 'terms', title: 'Terms', icon: ShieldCheck },
  { id: 'personal', title: 'Personal', icon: User },
  { id: 'nok', title: 'Next of Kin', icon: Users },
  { id: 'employment', title: 'Employment', icon: Briefcase },
  { id: 'guarantors', title: 'Guarantors', icon: Users },
  { id: 'bio', title: 'Bio Data', icon: CheckCircle2 },
  { id: 'payment', title: 'Payment', icon: CreditCard },
];

export default function RegistrationForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [staffList, setStaffList] = useState<{id: string, fullName: string}[]>([]);

  useEffect(() => {
    const fetchStaff = async () => {
      const querySnapshot = await getDocs(collection(db, 'staff'));
      const staff = querySnapshot.docs.map(doc => ({
        id: doc.id,
        fullName: doc.data().fullName
      }));
      setStaffList(staff);
    };
    fetchStaff();
  }, []);

  const [formData, setFormData] = useState<Partial<Candidate>>({
    assignedAgentId: '',
    name: { surname: '', firstName: '', otherName: '' },
    address: '',
    dob: '',
    gender: 'Male',
    nationality: 'Nigerian',
    stateOfOrigin: '',
    lga: '',
    religion: '',
    phone: '',
    whatsapp: '',
    email: '',
    maritalStatus: 'Single',
    handicap: false,
    handicapDetails: '',
    validIdNumber: '',
    idType: '',
    nextOfKin: {
      name: { surname: '', firstName: '', otherName: '' },
      address: '',
      phone: '',
      email: '',
      whatsapp: '',
      relationship: ''
    },
    desiredPositions: ['', '', ''],
    jobLocations: ['', '', ''],
    jobMode: 'On-site',
    yearsOfExperience: 0,
    guarantors: [
      {
        name: { surname: '', firstName: '', otherName: '' },
        address: '',
        phone: '',
        email: '',
        dob: '',
        gender: 'Male',
        relationshipToCandidate: '',
        occupation: '',
        workAddress: '',
        howLongKnown: '',
        whatsapp: '',
        idType: '',
        idNumber: '',
        idUrl: ''
      },
      {
        name: { surname: '', firstName: '', otherName: '' },
        address: '',
        phone: '',
        email: '',
        dob: '',
        gender: 'Male',
        relationshipToCandidate: '',
        occupation: '',
        workAddress: '',
        howLongKnown: '',
        whatsapp: '',
        idType: '',
        idNumber: '',
        idUrl: ''
      }
    ],
    acquaintances: Array(10).fill({ surname: '', firstName: '', otherName: '' }),
    highestQualification: '',
    currentEmploymentStatus: '',
    expectedSalary: '',
    resumeUrl: '',
    role: 'candidate',
    createdAt: new Date().toISOString(),
    paymentConfirmed: false,
    submitted: false
  });

  const updateFormData = (path: string, value: any) => {
    const keys = path.split('.');
    setFormData(prev => {
      const newData = { ...prev };
      let current: any = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const [agreed, setAgreed] = useState(false);

  const handleNext = () => {
    setError(null);

    if (currentStep === 0 && !agreed) {
      setError('You must agree to the terms and conditions to proceed.');
      return;
    }
    if (currentStep === 1) {
      if (!formData.assignedAgentId) return setError('Please select an assigned agent.');
      if (!formData.name?.surname || !formData.name?.firstName) return setError('Please provide your surname and first name.');
      if (!formData.address) return setError('Please provide your address.');
      if (!formData.dob) return setError('Please provide your date of birth.');
      if (!formData.nationality) return setError('Please provide your nationality.');
      if (!formData.stateOfOrigin) return setError('Please provide your state of origin.');
      if (!formData.lga) return setError('Please provide your LGA.');
      if (!formData.religion) return setError('Please provide your religion.');
      if (!formData.phone) return setError('Please provide your phone number.');
      if (!formData.email) return setError('Please provide your email address.');
      if (!formData.idType) return setError('Please select your valid ID type.');
      if (!formData.validIdNumber) return setError('Please provide your valid ID number.');
      if (formData.handicap && !formData.handicapDetails) return setError('Please provide details about your handicap.');
    }
    if (currentStep === 2) {
      if (!formData.nextOfKin?.name?.surname || !formData.nextOfKin?.name?.firstName) return setError('Please provide your next of kin\'s surname and first name.');
      if (!formData.nextOfKin?.address) return setError('Please provide your next of kin\'s address.');
      if (!formData.nextOfKin?.phone) return setError('Please provide your next of kin\'s phone number.');
      if (!formData.nextOfKin?.relationship) return setError('Please provide your relationship with your next of kin.');
    }
    if (currentStep === 3) {
      if (!formData.highestQualification) return setError('Please select your highest qualification.');
      if (!formData.currentEmploymentStatus) return setError('Please select your current employment status.');
      if (!formData.resumeUrl) return setError('Please upload your resume.');
      if (!formData.desiredPositions || !formData.desiredPositions[0]) return setError('Please provide at least one desired position.');
      if (!formData.jobLocations || !formData.jobLocations[0]) return setError('Please provide at least one preferred job location.');
    }
    if (currentStep === 4) {
      for (let i = 0; i < 2; i++) {
        const g = formData.guarantors?.[i];
        if (!g?.name?.surname || !g?.name?.firstName) return setError(`Please provide Guarantor ${i + 1}'s surname and first name.`);
        if (!g?.address) return setError(`Please provide Guarantor ${i + 1}'s address.`);
        if (!g?.phone) return setError(`Please provide Guarantor ${i + 1}'s phone number.`);
        if (!g?.relationshipToCandidate) return setError(`Please provide Guarantor ${i + 1}'s relationship to you.`);
        if (!g?.occupation) return setError(`Please provide Guarantor ${i + 1}'s occupation.`);
        if (!g?.workAddress) return setError(`Please provide Guarantor ${i + 1}'s work address.`);
        if (!g?.howLongKnown) return setError(`Please specify how long you have known Guarantor ${i + 1}.`);
        if (!g?.idType) return setError(`Please select Guarantor ${i + 1}'s ID type.`);
        if (!g?.idNumber) return setError(`Please provide Guarantor ${i + 1}'s ID number.`);
        if (!g?.idUrl) return setError(`Please upload Guarantor ${i + 1}'s valid ID.`);
      }
    }
    if (currentStep === 5) {

    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSave = async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('You must be logged in to save.');
      await setDoc(doc(db, 'candidates', user.uid), { ...formData, id: user.uid });

      setCurrentStep(prev => prev);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSubmit = async () => {
    if (!paymentConfirmed) {
      setError('Please complete the payment to submit your registration.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('You must be logged in to register.');

      await setDoc(doc(db, 'candidates', user.uid), {
        ...formData,
        id: user.uid,
        paymentConfirmed: true,
        submitted: true
      });

      if (formData.email) {
        const template = emailTemplates.applicationConfirmation(
          formData.name?.firstName || 'Candidate'
        );

        await sendEmail({
          to: formData.email,
          subject: template.subject,
          html: template.html
        }).catch(err => console.error('Failed to send confirmation email:', err));
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white mb-2">Registration Complete!</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8">Your application has been submitted to RVSL. Our recruiters will review it and get back to you.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-orange-600 text-white rounded-xl font-medium shadow-lg hover:bg-orange-700 transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {}
      <div className="mb-8">
        <div className="flex justify-between items-center relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 dark:bg-slate-800 -z-10" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-orange-600 transition-all duration-300 -z-10"
            style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
          />
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = idx <= currentStep;
            return (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${isActive ? 'bg-orange-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-400 border-2 border-slate-200 dark:border-slate-800'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] mt-2 font-medium uppercase tracking-wider ${isActive ? 'text-orange-600' : 'text-slate-400'}`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3 text-red-700 dark:text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-6 md:p-8"
          >
            {currentStep === 0 && <TermsStep agreed={agreed} setAgreed={setAgreed} />}
            {currentStep === 1 && <PersonalStep formData={formData} updateFormData={updateFormData} staffList={staffList} />}
            {currentStep === 2 && <NOKStep formData={formData} updateFormData={updateFormData} />}
            {currentStep === 3 && <EmploymentStep formData={formData} updateFormData={updateFormData} />}
            {currentStep === 4 && <GuarantorStep formData={formData} updateFormData={updateFormData} />}
            {currentStep === 5 && <BioStep formData={formData} updateFormData={updateFormData} />}
            {currentStep === 6 && <PaymentStep paymentConfirmed={paymentConfirmed} setPaymentConfirmed={setPaymentConfirmed} formData={formData} />}
          </motion.div>
        </AnimatePresence>

        <div className="p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex justify-between gap-4">
          <button
            onClick={handleBack}
            disabled={currentStep === 0 || isSubmitting}
            className="flex items-center gap-2 px-6 py-3 text-slate-600 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-white disabled:opacity-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="px-6 py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-300 transition-colors"
            >
              Save Draft
            </button>
            <button
              onClick={handleNext}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 bg-orange-600 text-white rounded-xl font-medium shadow-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Submitting...' : currentStep === STEPS.length - 1 ? 'Submit Registration' : 'Continue'}
              {currentStep < STEPS.length - 1 && <ChevronRight className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface NameInputProps {
  label: string;
  value: NameFields;
  update: (path: string, val: any) => void;
}

const NameInput: React.FC<NameInputProps> = ({ label, value, update }) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</label>
      <div className="grid grid-cols-3 gap-2">
        <input type="text" placeholder="Surname" value={value.surname} onChange={(e) => update('surname', e.target.value)} className="px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
        <input type="text" placeholder="First Name" value={value.firstName} onChange={(e) => update('firstName', e.target.value)} className="px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
        <input type="text" placeholder="Other Name" value={value.otherName} onChange={(e) => update('otherName', e.target.value)} className="px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
      </div>
    </div>
  );
};

function TermsStep({ agreed, setAgreed }: { agreed: boolean, setAgreed: (v: boolean) => void }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white text-center">Terms & Conditions</h2>
      <div className="prose prose-slate dark:prose-invert max-w-none h-80 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Registration Terms and Conditions</h3>

        <p className="mb-4 text-slate-700 dark:text-slate-300">
          Welcome to the Real Value & Stakes Limited candidate registration portal. By proceeding with this registration, you agree to the following terms and conditions as outlined in our official documentation:
        </p>

        <div className="space-y-4 text-slate-700 dark:text-slate-300">
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white">1. Accuracy of Information</h4>
            <p>You confirm that all information provided during this registration process is accurate, true, and complete. Any false information may lead to immediate disqualification from our recruitment process.</p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white">2. Registration Fees</h4>
            <p>A non-refundable registration fee is required to complete your application. The fee structure is strictly as follows:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>₦5,000</strong> for Non-Graduates (SSCE, OND, NCE, Diploma, etc.)</li>
              <li><strong>₦10,000</strong> for Graduates (HND, BSc, BA, MSc, PhD, etc.)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white">3. Background Checks & Guarantors</h4>
            <p>Real Value & Stakes Limited reserves the right to conduct comprehensive background checks and verify all information provided. This includes contacting your listed guarantors, previous employers, and educational institutions.</p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white">4. Data Privacy</h4>
            <p>Your personal data will be handled in accordance with our Privacy Policy. We collect and process your data solely for recruitment, placement, and employment verification purposes.</p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white">5. Placement Guarantee</h4>
            <p>While we strive to match candidates with suitable opportunities, registration and payment of the fee do not guarantee immediate employment or placement.</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
          <p className="text-blue-800 dark:text-blue-300 text-xs text-center">
            By checking the box below, you acknowledge that you have read and agree to these terms, as well as the full Terms & Conditions provided in the official company PDF documentation.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-900/20">
        <input type="checkbox" id="agree" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="w-5 h-5 rounded border-slate-300 dark:border-slate-700 text-orange-600 focus:ring-orange-500" />
        <label htmlFor="agree" className="text-sm font-medium text-orange-900 dark:text-orange-400">I confirm that I have read, understood, and agreed to all the terms above.</label>
      </div>
    </div>
  );
}

function PersonalStep({ formData, updateFormData, staffList }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white text-center">Personal Details</h2>

      <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-900/20 mb-6">
        <label className="text-sm font-bold text-orange-900 dark:text-orange-400 flex items-center gap-2 mb-2">
          <UserCheck className="w-4 h-4" /> Select Your Assigned Agent
        </label>
        <select
          required
          value={formData.assignedAgentId}
          onChange={(e) => updateFormData('assignedAgentId', e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-orange-500 font-medium"
        >
          <option value="">-- Choose an Agent --</option>
          {staffList.map((staff: any) => (
            <option key={staff.id} value={staff.id}>{staff.fullName}</option>
          ))}
        </select>
        <p className="text-[10px] text-orange-700 dark:text-orange-300 mt-2 italic">
          * This agent will be responsible for your application and communication.
        </p>
      </div>

      <NameInput label="Full Name" value={formData.name} update={(path, val) => updateFormData(`name.${path}`, val)} />
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Address</label>
        <textarea value={formData.address} onChange={(e) => updateFormData('address', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
        <p className="text-[10px] text-slate-500 mt-1">Your current residential address.</p>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">DOB</label>
          <input type="date" value={formData.dob} onChange={(e) => updateFormData('dob', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
          <p className="text-[10px] text-slate-500 mt-1">Your date of birth.</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Sex</label>
          <select value={formData.gender} onChange={(e) => updateFormData('gender', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          <p className="text-[10px] text-slate-500 mt-1">Your gender.</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nationality</label>
          <input type="text" value={formData.nationality} onChange={(e) => updateFormData('nationality', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
          <p className="text-[10px] text-slate-500 mt-1">Your country of citizenship.</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">State of Origin</label>
          <input type="text" value={formData.stateOfOrigin} onChange={(e) => updateFormData('stateOfOrigin', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
          <p className="text-[10px] text-slate-500 mt-1">Your state of origin.</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">LGA</label>
          <input type="text" value={formData.lga} onChange={(e) => updateFormData('lga', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
          <p className="text-[10px] text-slate-500 mt-1">Your Local Government Area.</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Religion</label>
          <input type="text" value={formData.religion} onChange={(e) => updateFormData('religion', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
          <p className="text-[10px] text-slate-500 mt-1">Your religious affiliation.</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tel</label>
          <input type="tel" value={formData.phone} onChange={(e) => updateFormData('phone', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
          <p className="text-[10px] text-slate-500 mt-1">Your primary phone number.</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email</label>
          <input type="email" value={formData.email} onChange={(e) => updateFormData('email', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
          <p className="text-[10px] text-slate-500 mt-1">Your active email address.</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">WhatsApp</label>
          <input type="tel" value={formData.whatsapp} onChange={(e) => updateFormData('whatsapp', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
          <p className="text-[10px] text-slate-500 mt-1">Your WhatsApp number (optional).</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Marital Status</label>
          <select value={formData.maritalStatus} onChange={(e) => updateFormData('maritalStatus', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Divorced">Divorced</option>
            <option value="Widowed">Widowed</option>
          </select>
          <p className="text-[10px] text-slate-500 mt-1">Your current marital status.</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Handicap?</label>
          <div className="flex gap-4">
            <label><input type="radio" checked={formData.handicap} onChange={() => updateFormData('handicap', true)} /> Yes</label>
            <label><input type="radio" checked={!formData.handicap} onChange={() => updateFormData('handicap', false)} /> No</label>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Do you have any physical challenges?</p>
        </div>
        {formData.handicap && (
          <div className="space-y-2 col-span-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">If yes, what's your challenge?</label>
            <input type="text" value={formData.handicapDetails} onChange={(e) => updateFormData('handicapDetails', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
          </div>
        )}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Valid ID Number</label>
          <input type="text" value={formData.validIdNumber} onChange={(e) => updateFormData('validIdNumber', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
          <p className="text-[10px] text-slate-500 mt-1">The unique number on your ID card.</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">ID Type</label>
          <select value={formData.idType} onChange={(e) => updateFormData('idType', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <option value="">Select ID Type</option>
            <option value="National ID (NIN)">National ID (NIN)</option>
            <option value="Driver's License">Driver's License</option>
            <option value="International Passport">International Passport</option>
            <option value="Voter's Card (INEC)">Voter's Card (INEC)</option>
          </select>
          <p className="text-[10px] text-slate-500 mt-1">Type of government-issued ID.</p>
        </div>
      </div>
    </div>
  );
}

function NOKStep({ formData, updateFormData }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white text-center">Next of Kin Details</h2>
      <NameInput label="NOK Name" value={formData.nextOfKin.name} update={(path, val) => updateFormData(`nextOfKin.name.${path}`, val)} />
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Address</label>
        <textarea value={formData.nextOfKin.address} onChange={(e) => updateFormData('nextOfKin.address', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
        <p className="text-[10px] text-slate-500 mt-1">Their current residential address.</p>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tel</label>
          <input type="tel" value={formData.nextOfKin.phone} onChange={(e) => updateFormData('nextOfKin.phone', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
          <p className="text-[10px] text-slate-500 mt-1">Their active phone number.</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email</label>
          <input type="email" value={formData.nextOfKin.email} onChange={(e) => updateFormData('nextOfKin.email', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
          <p className="text-[10px] text-slate-500 mt-1">Their active email address (optional).</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">WhatsApp</label>
          <input type="tel" value={formData.nextOfKin.whatsapp} onChange={(e) => updateFormData('nextOfKin.whatsapp', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
          <p className="text-[10px] text-slate-500 mt-1">Their WhatsApp number (optional).</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Relationship</label>
          <input type="text" value={formData.nextOfKin.relationship} onChange={(e) => updateFormData('nextOfKin.relationship', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
          <p className="text-[10px] text-slate-500 mt-1">How are they related to you? (e.g., Brother, Mother)</p>
        </div>
      </div>
    </div>
  );
}

function EmploymentStep({ formData, updateFormData }: any) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File is too large. Maximum size is 10MB.');
      e.target.value = '';
      return;
    }

    const fileRef = ref(storage, `resumes/${auth.currentUser?.uid || 'temp'}_${file.name}`);
    const uploadTask = uploadBytesResumable(fileRef, file);

    setUploading(true);
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(p);
      },
      (error) => {
        console.error('Upload failed:', error);
        setUploading(false);
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        updateFormData('resumeUrl', url);
        setUploading(false);
      }
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white text-center">Employment Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Current Employment Status</label>
          <select value={formData.currentEmploymentStatus} onChange={(e) => updateFormData('currentEmploymentStatus', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <option value="Employed">Employed</option>
            <option value="Unemployed">Unemployed</option>
            <option value="Self-employed">Self-employed</option>
          </select>
          <p className="text-[10px] text-slate-500 mt-1">Your current work status.</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Highest Qualification</label>
          <select value={formData.highestQualification} onChange={(e) => updateFormData('highestQualification', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <option value="">Select Qualification</option>
            <option value="SSCE / O'Level">SSCE / O'Level</option>
            <option value="OND / ND">OND / ND</option>
            <option value="NCE">NCE</option>
            <option value="Diploma">Diploma</option>
            <option value="HND">HND</option>
            <option value="BSc / BA / BEng / BTech">BSc / BA / BEng / BTech</option>
            <option value="MSc / MA / MBA">MSc / MA / MBA</option>
            <option value="PhD">PhD</option>
            <option value="Other (Below BSc)">Other (Below BSc)</option>
            <option value="Other (BSc and above)">Other (BSc and above)</option>
          </select>
          <p className="text-[10px] text-slate-500 mt-1">Your highest level of education.</p>
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Upload Resume (PDF/DOC)</label>
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileUpload}
            disabled={uploading}
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 dark:file:bg-orange-900/30 dark:file:text-orange-400"
          />
        </div>
        {uploading && (
          <div className="w-full bg-slate-200 rounded-full h-2.5 dark:bg-slate-700 mt-2">
            <div className="bg-orange-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
        )}
        {formData.resumeUrl && !uploading && (
          <p className="text-sm text-emerald-600 font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Resume uploaded successfully
          </p>
        )}
      </div>

      <div className="space-y-4">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Desired Positions</label>
        <p className="text-[10px] text-slate-500 mt-1">List up to 3 positions you are applying for.</p>
        {formData.desiredPositions.map((pos: string, idx: number) => (
          <input key={idx} type="text" value={pos} onChange={(e) => {
            const newPos = [...formData.desiredPositions];
            newPos[idx] = e.target.value;
            updateFormData('desiredPositions', newPos);
          }} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700" placeholder={`Position ${idx + 1}`} />
        ))}
      </div>
    </div>
  );
}

function GuarantorStep({ formData, updateFormData }: any) {
  const [uploading, setUploading] = useState<Record<number, boolean>>({});
  const [progress, setProgress] = useState<Record<number, number>>({});

  const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File is too large. Maximum size is 5MB.');
      e.target.value = '';
      return;
    }

    const fileRef = ref(storage, `guarantor_ids/${auth.currentUser?.uid || 'temp'}_guarantor_${idx}_${file.name}`);
    const uploadTask = uploadBytesResumable(fileRef, file);

    setUploading(prev => ({ ...prev, [idx]: true }));
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(prev => ({ ...prev, [idx]: p }));
      },
      (error) => {
        console.error('Upload failed:', error);
        setUploading(prev => ({ ...prev, [idx]: false }));
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        updateFormData(`guarantors.${idx}.idUrl`, url);
        setUploading(prev => ({ ...prev, [idx]: false }));
      }
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Guarantor Details</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Please provide details for two (2) reliable guarantors who can verify your character and professional standing.
        </p>
      </div>

      <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-xl border border-orange-100 dark:border-orange-900/20 mb-6">
        <h3 className="text-sm font-bold text-orange-800 dark:text-orange-400 uppercase tracking-wider mb-2 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" /> Legal Agreement
        </h3>
        <p className="text-xs text-orange-700 dark:text-orange-300 leading-relaxed">
          By providing these guarantors, I solemnly declare that the persons named below have consented to act as my guarantors. I understand that RVSL may contact them to verify my information. I further agree that any false information provided herein may lead to my disqualification or termination of employment.
        </p>
      </div>

      {formData.guarantors.map((g: any, idx: number) => (
        <div key={idx} className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-700">
            <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              {idx + 1}
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">Guarantor {idx + 1}</h3>
          </div>

          <NameInput label="Full Name" value={g.name} update={(path, val) => updateFormData(`guarantors.${idx}.name.${path}`, val)} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Occupation</label>
              <input type="text" value={g.occupation} onChange={(e) => updateFormData(`guarantors.${idx}.occupation`, e.target.value)} className="w-full px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-orange-500" placeholder="e.g. Civil Servant" />
              <p className="text-[10px] text-slate-500 mt-1">Their current job or profession.</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
              <input type="tel" value={g.phone} onChange={(e) => updateFormData(`guarantors.${idx}.phone`, e.target.value)} className="w-full px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-orange-500" placeholder="080..." />
              <p className="text-[10px] text-slate-500 mt-1">Their active phone number.</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
              <input type="email" value={g.email} onChange={(e) => updateFormData(`guarantors.${idx}.email`, e.target.value)} className="w-full px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-orange-500" placeholder="email@example.com" />
              <p className="text-[10px] text-slate-500 mt-1">Their active email address (optional).</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">WhatsApp</label>
              <input type="tel" value={g.whatsapp} onChange={(e) => updateFormData(`guarantors.${idx}.whatsapp`, e.target.value)} className="w-full px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-orange-500" />
              <p className="text-[10px] text-slate-500 mt-1">Their WhatsApp number (optional).</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Relationship</label>
              <input type="text" value={g.relationshipToCandidate} onChange={(e) => updateFormData(`guarantors.${idx}.relationshipToCandidate`, e.target.value)} className="w-full px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-orange-500" placeholder="e.g. Uncle, Former Boss" />
              <p className="text-[10px] text-slate-500 mt-1">How are they related to you?</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">How long have they known you?</label>
              <input type="text" value={g.howLongKnown} onChange={(e) => updateFormData(`guarantors.${idx}.howLongKnown`, e.target.value)} className="w-full px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-orange-500" placeholder="e.g. 5 years" />
              <p className="text-[10px] text-slate-500 mt-1">Duration of your relationship.</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Valid ID Type</label>
              <select value={g.idType} onChange={(e) => updateFormData(`guarantors.${idx}.idType`, e.target.value)} className="w-full px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-orange-500">
                <option value="">Select ID Type</option>
                <option value="National ID (NIN)">National ID (NIN)</option>
                <option value="Driver's License">Driver's License</option>
                <option value="International Passport">International Passport</option>
                <option value="Voter's Card (INEC)">Voter's Card (INEC)</option>
              </select>
              <p className="text-[10px] text-slate-500 mt-1">Type of government-issued ID.</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Valid ID Number</label>
              <input type="text" value={g.idNumber} onChange={(e) => updateFormData(`guarantors.${idx}.idNumber`, e.target.value)} className="w-full px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-orange-500" placeholder="Enter ID Number" />
              <p className="text-[10px] text-slate-500 mt-1">The unique number on their ID card.</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Upload Valid ID</label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => handleIdUpload(e, idx)}
              disabled={uploading[idx]}
              className="w-full px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 dark:file:bg-orange-900/30 dark:file:text-orange-400"
            />
            {uploading[idx] && (
              <div className="w-full bg-slate-200 rounded-full h-1.5 dark:bg-slate-700 mt-2">
                <div className="bg-orange-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress[idx] || 0}%` }}></div>
              </div>
            )}
            {g.idUrl && !uploading[idx] && (
              <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3 h-3" /> ID uploaded successfully
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Home Address</label>
            <textarea value={g.address} onChange={(e) => updateFormData(`guarantors.${idx}.address`, e.target.value)} className="w-full px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-orange-500" rows={2} />
            <p className="text-[10px] text-slate-500 mt-1">Their current residential address.</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Work Address</label>
            <textarea value={g.workAddress} onChange={(e) => updateFormData(`guarantors.${idx}.workAddress`, e.target.value)} className="w-full px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-orange-500" rows={2} />
            <p className="text-[10px] text-slate-500 mt-1">Their current workplace address.</p>
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <ShieldCheck className="w-6 h-6 text-orange-600" />
        <p className="text-[10px] text-slate-500 leading-tight">
          By proceeding, I confirm that the information provided for my guarantors is accurate and that I have obtained their explicit consent to be contacted by RVSL for verification purposes.
        </p>
      </div>
    </div>
  );
}

function BioStep({ formData, updateFormData }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white text-center">Bio Data Update</h2>
      <div className="space-y-4">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Acquaintances (Names)</label>
        <p className="text-[10px] text-slate-500 mt-1">Provide the names of up to 3 acquaintances (optional).</p>
        {formData.acquaintances.map((a: NameFields, idx: number) => (
          <NameInput key={idx} label={`Acquaintance ${idx + 1}`} value={a} update={(path, val) => updateFormData(`acquaintances.${idx}.${path}`, val)} />
        ))}
      </div>
    </div>
  );
}

function PaymentStep({ paymentConfirmed, setPaymentConfirmed, formData }: any) {
  const bscAndAbove = ["HND", "BSc / BA / BEng / BTech", "MSc / MA / MBA", "PhD", "Other (BSc and above)"];
  const amount = bscAndAbove.includes(formData.highestQualification) ? 10000 : 5000;

  const config = {
    reference: (new Date()).getTime().toString(),
    email: formData.email || 'candidate@example.com',
    amount: amount * 100,
    publicKey: (import.meta as any).env?.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  };

  const initializePayment = usePaystackPayment(config);

  const onSuccess = () => {
    setPaymentConfirmed(true);
  };

  const onClose = () => {

  };

  return (
    <div className="space-y-6 text-center">
      <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Payment</h2>
      <p className="text-slate-500">
        Please pay the non-refundable registration fee of <strong>₦{amount.toLocaleString()}</strong> to proceed.
      </p>
      <p className="text-sm text-slate-400">
        Fee is based on your highest qualification: {formData.highestQualification || 'Not specified'}
      </p>
      <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl text-sm text-orange-800 dark:text-orange-200 text-left">
        <strong>Note:</strong> Registration fee is ₦10,000 for Graduates (HND, BSc and above) and ₦5,000 for Non-Graduates.
      </div>

      <button
        onClick={() => {
          if (!paymentConfirmed) {
            initializePayment({ onSuccess, onClose });
          }
        }}
        disabled={paymentConfirmed}
        className={`px-8 py-4 rounded-xl font-bold ${paymentConfirmed ? 'bg-emerald-600 text-white' : 'bg-orange-600 text-white hover:bg-orange-700'}`}
      >
        {paymentConfirmed ? 'Payment Confirmed' : 'Pay with Paystack'}
      </button>
    </div>
  );
}
