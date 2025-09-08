import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
const supabaseUrl = 'https://jtninxstcjatxbwsobmn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0bmlueHN0Y2phdHhid3NvYm1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMzAzNzMsImV4cCI6MjA3MjgwNjM3M30.sgXPImSwFHJjMDVg6WfATsnW7ZNbgjm7fP03f0qzVAE';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- MOCK ICONS (using emojis for web) ---
const Icon = ({ name, size = 24, color = '#000' }) => {
    const icons = {
        home: '🏠',
        people: '👥',
        cloud: '☁️',
        settings: '⚙️',
        airplane: '✈️',
        ai: '🧠',
        camera: '📷',
        chart: '📈',
        edit: '✏️',
        computer: '💻',
        wrench: '🔧',
        building: '🏗️',
        bolt: '⚡',
        satellite: '📡',
        flask: '🧪',
        heart: '❤️',
        car: '🚗',
        user: '👤',
        id: '🆔',
        briefcase: '💼',
        download: '📥',
        'arrow-left': '⬅️',
        share: '📤',
        upload: '⬆️',
        filter: '🔍',
    };
    return <span style={{ fontSize: size, color, lineHeight: 1 }}>{icons[name] || '❓'}</span>;
};

// --- CUSTOM HEADER COMPONENTS ---
const WaveHeader = ({ title }) => (
    <div style={styles.headerContainer}>
        <div style={styles.headerRect} />
        <p style={styles.headerTitle}>{title}</p>
    </div>
);
const BackButton = ({ onClick }) => (
    <button onClick={onClick} style={styles.backButton}>
        <Icon name="arrow-left" size={24} color="#fff" />
    </button>
);
const HeaderWithBack = ({ title, onBackPress }) => (
    <div style={{position: 'relative'}}>
        <WaveHeader title={title} />
        {onBackPress && <BackButton onClick={onBackPress} />}
    </div>
);

// --- CUSTOM MESSAGE BOX COMPONENT ---
const MessageBox = ({ message, onClose }) => {
    if (!message) return null;
    return (
        <div style={styles.messageBoxOverlay}>
            <div style={styles.messageBox}>
                <p style={styles.messageText}>{message}</p>
                <button onClick={onClose} style={styles.messageButton}>OK</button>
            </div>
        </div>
    );
};

// --- SCREENS ---
const AuthScreen = ({ navigate, setUserProfile, showMessage }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '', password: '', confirmPassword: '', fullName: '', employeeId: '',
        department: 'Aeronautical Engineering', role: 'Staff'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const departments = [
        'Aeronautical Engineering', 'Artificial Intelligence & Data Science', 'Computer Science & Engineering',
        'Mechanical Engineering', 'Civil Engineering', 'Electrical & Electronics Engineering',
        'Electronics & Communication Engineering', 'Information Technology', 'Chemical Engineering',
        'Mechatronics','Computer Science and Bussiness Science'
    ];
    
    const handleInputChange = (field, value) => {
        setFormData(prev => ({...prev, [field]: value}));
        setError('');
    };

    const handleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password
            });
            if (error) {
                setError(error.message || 'Login failed.');
                return;
            }
            if (data.user) {
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', data.user.id)
                    .single();
                if (profileError) {
                    setError('Profile not found. Please register or contact admin.');
                    return;
                }
                setUserProfile({
                    name: profileData.full_name, position: profileData.role, employeeId: profileData.employee_id,
                    department: profileData.department, role: profileData.role, userId: data.user.id,
                });
                navigate('MainApp');
            }
        } catch (err) {
            setError('An unexpected error occurred during login.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!formData.email || !formData.fullName || !formData.employeeId || !formData.password) {
            setError('Please fill all the fields.');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password
            });
            if (error) {
                setError(error.message || 'Registration failed.');
                return;
            }
            if (data.user) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert({
                        id: data.user.id,
                        full_name: formData.fullName,
                        employee_id: formData.employeeId,
                        department: formData.department,
                        role: formData.role
                    });
                if (profileError) {
                    setError(`Profile creation failed: ${profileError.message}`);
                    return;
                }
                setUserProfile({
                    name: formData.fullName, position: formData.role, employeeId: formData.employeeId,
                    department: formData.department, role: formData.role, userId: data.user.id,
                });
                navigate('MainApp');
                showMessage("Registration successful! You are now logged in.");
            }
        } catch (err) {
            setError('An unexpected error occurred during registration.');
        } finally {
            setLoading(false);
        }
    };

    const handleAuthAction = () => {
        if (isLogin) {
            handleLogin();
        } else {
            handleRegister();
        }
    };

    return (
        <div style={styles.authContainer}>
            <div style={styles.authTopBg} />
            <div style={styles.authContent}>
                <div style={styles.authCard}>
                    <p style={styles.authTitle}>{isLogin ? 'Login' : 'Register'}</p>
                    {error && <p style={styles.errorText}>{error}</p>}
                    <input style={styles.input} placeholder="Email" type="email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} />
                    
                    {!isLogin && (
                        <>
                            <input style={styles.input} placeholder="Full Name" value={formData.fullName} onChange={e => handleInputChange('fullName', e.target.value)} />
                            <input style={styles.input} placeholder="Employee ID" value={formData.employeeId} onChange={e => handleInputChange('employeeId', e.target.value)} />
                           <select style={styles.input} value={formData.department} onChange={e => handleInputChange('department', e.target.value)}>
                                {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                            </select>
                            <select style={styles.input} value={formData.role} onChange={e => handleInputChange('role', e.target.value)}>
                                <option value="Staff">Staff</option>
                                <option value="HOD">HOD</option>
                                <option value="Class Advisor">Class Advisor</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </>
                    )}
                    <input style={styles.input} placeholder="Password" type="password" value={formData.password} onChange={e => handleInputChange('password', e.target.value)} />
                    {!isLogin && <input style={styles.input} placeholder="Retype Password" type="password" value={formData.confirmPassword} onChange={e => handleInputChange('confirmPassword', e.target.value)} />}
                    
                    <button style={styles.secondaryButton} onClick={handleAuthAction} disabled={loading}>
                        <span style={styles.secondaryButtonText}>{loading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}</span>
                    </button>
                    <button style={styles.mainButton} onClick={() => { setIsLogin(!isLogin); setError(''); }}>
                        <span style={styles.mainButtonText}>{isLogin ? 'Switch to Register' : 'Switch to Login'}</span>
                    </button>
                </div>
                <div style={styles.logoContainer}>
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2R7bHsdVlhJda1oUOZ1NPc7lvacTuGPvHgg&s"  style={styles.logoImage} alt="College Logo" />
                </div>
            </div>
        </div>
    );
};
const calcStudentAttendance = (records, regNo) => {
    let totalDaysWithAttendance = 0;
    let presentDays = 0;
    records.forEach(rec => {
        const allPeriods = [...rec.morning_attendance, ...rec.afternoon_attendance];
        const attendanceExists = allPeriods.some(p => p.total > 0);
        if (!attendanceExists) return;
        const isAbsentForAnyPeriod = allPeriods.some(p => {
            const absentRegNos = (p.absentNumbers || '').split(',').map(s => s.trim());
            return absentRegNos.includes(regNo);
        });
        totalDaysWithAttendance += 1;
        if (!isAbsentForAnyPeriod) {
            presentDays += 1;
        }
    });
    if (totalDaysWithAttendance === 0) return 0;
    return ((presentDays / totalDaysWithAttendance) * 100).toFixed(1);
};
const DepartmentScreen = ({ navigate, attendanceRecords, userProfile, departments }) => {
    const [selectedDept, setSelectedDept] = useState(userProfile?.department || departments[0]);
    const [selectedYear, setSelectedYear] = useState('First Year');
    const [selectedSection, setSelectedSection] = useState('Section A');
    const years = ['First Year', 'Second Year', 'Third Year', 'Fourth Year'];
    const sections = ['Section A', 'Section B'];
    const filteredRecords = useMemo(() => {
        return attendanceRecords.filter(record =>
            record.department === selectedDept &&
            record.year === selectedYear &&
            record.section === selectedSection
        );
    }, [attendanceRecords, selectedDept, selectedYear, selectedSection]);
    const total = useMemo(() => {
        return filteredRecords.reduce((sum, rec) => sum + 
            (rec.morning_attendance?.reduce((mSum, p) => mSum + p.total, 0) || 0) +
            (rec.afternoon_attendance?.reduce((aSum, p) => aSum + p.total, 0) || 0), 0);
    }, [filteredRecords]);
    const present = useMemo(() => {
        return filteredRecords.reduce((sum, rec) => sum + 
            (rec.morning_attendance?.reduce((mSum, p) => mSum + p.present, 0) || 0) +
            (rec.afternoon_attendance?.reduce((aSum, p) => aSum + p.present, 0) || 0), 0);
    }, [filteredRecords]);
    const absent = useMemo(() => {
        return filteredRecords.reduce((sum, rec) => sum + 
            (rec.morning_attendance?.reduce((mSum, p) => mSum + p.absent, 0) || 0) +
            (rec.afternoon_attendance?.reduce((aSum, p) => aSum + p.absent, 0) || 0), 0);
    }, [filteredRecords]);
    const onDuty = useMemo(() => {
        return filteredRecords.reduce((sum, rec) => sum + 
            (rec.morning_attendance?.reduce((mSum, p) => mSum + p.onDuty, 0) || 0) +
            (rec.afternoon_attendance?.reduce((aSum, p) => aSum + p.onDuty, 0) || 0), 0);
    }, [filteredRecords]);
    const chartData = total === 0 ? [] : [
        { label: 'Present', value: (present / total) * 100, color: '#2ecc71' },
        { label: 'Absent', value: (absent / total) * 100, color: '#e74c3c' },
        { label: 'On Duty', value: (onDuty / total) * 100, color: '#f39c12' },
    ];
    const departmentData = [
        { name: 'Aeronautical Engineering', icon: 'airplane' },
        { name: 'Artificial Intelligence & Data Science', icon: 'ai' },
        { name: 'Computer Science & Engineering', icon: 'computer' },
        { name: 'Mechanical Engineering', icon: 'wrench' },
        { name: 'Civil Engineering', icon: 'building' },
        { name: 'Electrical & Electronics Engineering', icon: 'bolt' },
        { name: 'Electronics & Communication Engineering', icon: 'satellite' },
        { name: 'Information Technology', icon: 'computer' },
        { name: 'Chemical Engineering', icon: 'flask' },
        { name: 'Mechatronics', icon: 'wrench' },
        { name: 'Computer Science and Bussiness Science', icon: 'computer' }
    ];
    return (
        <div style={styles.screenContainer}>
            <WaveHeader title="Attendance Management Application" />
            <div style={styles.pieChartContainer}>
                <div style={{ width: '60%' }}>
                    <PieChart data={chartData} />
                </div>
                <div style={styles.pieChartLegend}>
                    {chartData.length > 0 ? chartData.map(d => (
                        <div key={d.label} style={styles.pieChartLegendItem}>
                            <span style={{ backgroundColor: d.color, ...styles.pieChartLegendColor }}></span>
                            <p>{d.label}: {d.value.toFixed(1)}%</p>
                        </div>
                    )) : (
                        <p style={styles.emptyListMessage}>No attendance data for this class.</p>
                    )}
                </div>
            </div>
            <div style={{ display: 'flex', gap: 10, margin: '0 20px 20px 20px', flexWrap: 'wrap' }}>
                <select style={{...styles.input, flex: 1}} value={selectedDept} onChange={e => setSelectedDept(e.target.value)}>
                    {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                </select>
                <select style={{...styles.input, flex: 1}} value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
                    {years.map(year => <option key={year} value={year}>{year}</option>)}
                </select>
                <select style={{...styles.input, flex: 1}} value={selectedSection} onChange={e => setSelectedSection(e.target.value)}>
                    {sections.map(section => <option key={section} value={section}>{section}</option>)}
                </select>
            </div>
            <p style={styles.sectionTitle}>Department</p>
            <div style={{ flex: 1, paddingBottom: 20 }}>
                {departmentData.map((dept, index) => (
                    <button key={index} style={styles.deptButton} onClick={() => navigate('Year', { department: dept.name })}>
                        <Icon name={dept.icon} size={28} color="#8e44ad" />
                        <span style={styles.deptButtonText}>{dept.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};
const YearScreen = ({ navigate, params }) => {
    const years = ['First Year', 'Second Year', 'Third Year', 'Fourth Year'];
    return (
        <div style={styles.screenContainer}>
            <HeaderWithBack
                title="Select Year"
                onBackPress={() => navigate('MainApp', { screen: 'Home' })}
            />
            <p style={styles.sectionTitle}>{params.department}</p>
            <div style={styles.yearGrid}>
                {years.map((year, index) => (
                    <button key={index} style={styles.yearCard} onClick={() => navigate('Section', { ...params, year: year })}>
                        <span style={styles.yearCardNumber}>{index + 1}</span>
                        <span style={styles.yearCardText}>{year}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};
const SectionScreen = ({ navigate, params }) => {
    const sections = ['Section A', 'Section B'];
    const { year, department } = params;
    return (
        <div style={styles.screenContainer}>
            <HeaderWithBack
                title="Select Section"
                onBackPress={() => navigate('Year', { department })}
            />
            <p style={styles.sectionTitle}>{`${department} - ${year}`}</p>
            <div style={styles.yearGrid}>
                {sections.map((section, index) => (
                    <button key={index} style={styles.yearCard} onClick={() => navigate('MainApp', { ...params, screen: 'Attendance', year, section })}>
                        <span style={styles.yearCardText}>{section}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};
const AttendanceScreen = ({
    addAttendanceRecord,
    year,
    section,
    department,
    navigate,
    showMessage,
    studentList
}) => {
    const initialPeriodState = { total: '', present: '', absent: '', onDuty: '', absentNumbers: '' };
    const [attendanceData, setAttendanceData] = useState({
        morning: Array(4).fill(initialPeriodState),
        afternoon: Array(4).fill(initialPeriodState)
    });
    const [selectedSession, setSelectedSession] = useState('morning');
    const [selectedPeriodIndex, setSelectedPeriodIndex] = useState(null);
    const rosterKey = `${department}-${year}-${section}`;
    const currentRoster = studentList[rosterKey] || [];
    const validRegNos = useMemo(() => currentRoster.map(s => s.regNo.trim()), [currentRoster]);
    const handleAttendanceChange = (field, value) => {
        setAttendanceData(prevData => {
            const newSessionPeriods = [...prevData[selectedSession]];
            const numericValue = (field !== 'absentNumbers' && value !== '') ? parseInt(value, 10) : value;
            newSessionPeriods[selectedPeriodIndex] = {
                ...newSessionPeriods[selectedPeriodIndex],
                [field]: isNaN(numericValue) ? value : numericValue
            };
            return {
                ...prevData,
                [selectedSession]: newSessionPeriods
            };
        });
    };
    const handleSubmit = () => {
        let hasErrors = false;
        const allPeriods = [...attendanceData.morning, ...attendanceData.afternoon];
        for (let i = 0; i < allPeriods.length; i++) {
            const period = allPeriods[i];
            if (!period.total && !period.present && !period.absent && !period.onDuty) {
                continue;
            }
            const periodNumber = (i < 4) ? i + 1 : i - 4 + 5;
            const sessionName = (i < 4) ? 'Morning' : 'Afternoon';
            const total = Number(period.total);
            const present = Number(period.present);
            const absent = Number(period.absent);
            const onDuty = Number(period.onDuty);
            if (present + absent + onDuty !== total) {
                showMessage(`${sessionName} Period ${periodNumber} - Sum of Present, Absent, and On Duty must equal Total students.`);
                hasErrors = true;
                break;
            }
            const absentNumbersArr = (period.absentNumbers || '')
                .split(',')
                .map(s => s.trim())
                .filter(s => s);
            const invalidRegNos = absentNumbersArr.filter(regNo => !validRegNos.includes(regNo));
            if (absentNumbersArr.length !== absent) {
                showMessage(`${sessionName} Period ${periodNumber} - Number of absent register numbers (${absentNumbersArr.length}) does not match Absent count (${absent}).`);
                hasErrors = true;
                break;
            }
            if (invalidRegNos.length > 0) {
                showMessage(`${sessionName} Period ${periodNumber} - Invalid register numbers: ${invalidRegNos.join(', ')}. Please check the roster.`);
                hasErrors = true;
                break;
            }
        }
        if (!hasErrors) {
            const newRecord = {
                date: new Date(),
                year,
                section,
                department,
                morning_attendance: attendanceData.morning,
                afternoon_attendance: attendanceData.afternoon
            };
            addAttendanceRecord(newRecord);
            setAttendanceData({
                morning: Array(4).fill(initialPeriodState),
                afternoon: Array(4).fill(initialPeriodState)
            });
            setSelectedPeriodIndex(null);
        }
    };
    const currentPeriodData = selectedPeriodIndex !== null ? attendanceData[selectedSession][selectedPeriodIndex] : initialPeriodState;
    return (
        <div style={styles.screenContainer}>
            <HeaderWithBack
                title={`${department}\n${year} - ${section}`}
                onBackPress={() => navigate('Section', { department, year })}
            />
            <div style={{ padding: 20 }}>
                <div style={styles.attendanceForm}>
                    <p style={{ fontWeight: 'bold' }}>Select Session</p>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                        <button
                            onClick={() => { setSelectedSession('morning'); setSelectedPeriodIndex(null); }}
                            style={{ ...styles.sessionButton, backgroundColor: selectedSession === 'morning' ? '#8e44ad' : '#f0f0f0', color: selectedSession === 'morning' ? '#fff' : '#333' }}
                        >
                            Morning
                        </button>
                        <button
                            onClick={() => { setSelectedSession('afternoon'); setSelectedPeriodIndex(null); }}
                            style={{ ...styles.sessionButton, backgroundColor: selectedSession === 'afternoon' ? '#8e44ad' : '#f0f0f0', color: selectedSession === 'afternoon' ? '#fff' : '#333' }}
                        >
                            Afternoon
                        </button>
                    </div>
                    <p style={{ fontWeight: 'bold', marginTop: 20 }}>Select Period to enter attendance:</p>
                    <div style={styles.periodGrid}>
                        {attendanceData[selectedSession].map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedPeriodIndex(index)}
                                style={{
                                    ...styles.periodButton,
                                    backgroundColor: selectedPeriodIndex === index ? '#8e44ad' : '#fff',
                                    color: selectedPeriodIndex === index ? '#fff' : '#333'
                                }}
                            >
                                {selectedSession === 'morning' ? `Period ${index + 1}` : `Period ${index + 5}`}
                            </button>
                        ))}
                    </div>
                    {selectedPeriodIndex !== null && (
                        <div style={styles.periodFormContainer}>
                            <p style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>
                                Enter Attendance for {selectedSession === 'morning' ? `Period ${selectedPeriodIndex + 1}` : `Period ${selectedPeriodIndex + 5}`}
                            </p>
                            <div style={styles.attendanceRow}>
                                <p>Total Students:</p>
                                <input type="number" style={styles.attendanceInput} value={currentPeriodData.total} onChange={(e) => handleAttendanceChange('total', e.target.value)} />
                            </div>
                            <div style={styles.attendanceRow}>
                                <p>Present:</p>
                                <input type="number" style={styles.attendanceInput} value={currentPeriodData.present} onChange={(e) => handleAttendanceChange('present', e.target.value)} />
                            </div>
                            <div style={styles.attendanceRow}>
                                <p>Absent:</p>
                                <input type="number" style={styles.attendanceInput} value={currentPeriodData.absent} onChange={(e) => handleAttendanceChange('absent', e.target.value)} />
                            </div>
                            <div style={styles.attendanceRow}>
                                <p>On Duty:</p>
                                <input type="number" style={styles.attendanceInput} value={currentPeriodData.onDuty} onChange={(e) => handleAttendanceChange('onDuty', e.target.value)} />
                            </div>
                            <p style={{marginTop: 20, marginBottom: 10}}>Absent Register Numbers (comma separated):</p>
                            <textarea
                                style={styles.largeInput}
                                rows={2}
                                value={currentPeriodData.absentNumbers}
                                onChange={(e) => handleAttendanceChange('absentNumbers', e.target.value)}
                            />
                        </div>
                    )}
                    <div style={{marginTop: 20, marginBottom: 10, fontSize: 13, color: '#555'}}>
                        <strong>Valid Register Numbers for this class:</strong>
                        <div style={{marginTop: 5, wordBreak: 'break-all'}}>
                            {currentRoster.length > 0 ? (
                                <ul style={{paddingLeft: 18, margin: 0}}>
                                    {currentRoster.map((student, idx) => (
                                        <li key={idx}>
                                            <span style={{fontWeight: 500}}>{student.regNo}</span> - {student.name}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <span style={{color: 'red'}}>No roster uploaded for this class.</span>
                            )}
                        </div>
                    </div>
                    <button style={styles.submitButton} onClick={handleSubmit}>
                        <span style={styles.submitButtonText}>Submit All Periods for the Day</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

const RosterScreen = ({ studentList, setStudentList, showMessage, departments, userId }) => {
    const [selectedDept, setSelectedDept] = useState(departments[0]);
    const [selectedYear, setSelectedYear] = useState('First Year');
    const [selectedSection, setSelectedSection] = useState('Section A');
    const [newStudent, setNewStudent] = useState({ name: '', regNo: '' });
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const years = ['First Year', 'Second Year', 'Third Year', 'Fourth Year'];
    const sections = ['Section A', 'Section B'];
    const getRosterKey = () => `${selectedDept}-${selectedYear}-${selectedSection}`;
    const currentRoster = studentList[getRosterKey()] || [];
    const filteredRoster = currentRoster.filter(student =>
        student.name.toLowerCase().includes(filter.toLowerCase()) ||
        student.regNo.toLowerCase().includes(filter.toLowerCase())
    );
    const handleInputChange = (field, value) => {
        setNewStudent(prev => ({ ...prev, [field]: value }));
    };
    const handleAddStudent = async () => {
        showMessage('Manual student entry is not implemented in the API, please use CSV upload.');
    };
    const handleFileUpload = async (event) => {
        setLoading(true);
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const text = e.target.result;
                const lines = text.split('\n').filter(line => line.trim() !== '');
                const newStudents = lines.map(line => {
                    const [regNo, name] = line.split(',');
                    return { regNo: regNo?.trim(), name: name?.trim() };
                }).filter(s => s.name && s.regNo);
                const newRoster = [...currentRoster, ...newStudents];
                try {
                    const { data, error } = await supabase
                        .from('student_rosters')
                        .upsert({
                            user_id: userId,
                            department: selectedDept,
                            year: selectedYear,
                            section: selectedSection,
                            roster_data: newRoster,
                        }, { onConflict: ['user_id', 'department', 'year', 'section'] })
                        .select();
                    if (error) {
                        showMessage(`Error uploading file: ${error.message}`);
                    } else {
                        showMessage(`${newStudents.length} students added to ${getRosterKey()} from file.`);
                        // Re-fetch or update state
                        const { data: updatedRosterData, error: updatedRosterError } = await supabase
                            .from('student_rosters')
                            .select('*')
                            .eq('user_id', userId);
                        if (!updatedRosterError) {
                            const rosterMap = {};
                            updatedRosterData.forEach(item => {
                                const key = `${item.department}-${item.year}-${item.section}`;
                                rosterMap[key] = item.roster_data;
                            });
                            setStudentList(rosterMap);
                        }
                    }
                } catch (err) {
                    showMessage(`An unexpected error occurred: ${err.message}`);
                } finally {
                    setLoading(false);
                }
            };
            reader.readAsText(file);
        }
    };
    const handleDownloadTemplate = () => {
        const csvContent = "RegNo,Name\n12345,John Doe\n67890,Jane Smith";
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'student_roster_template.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    return (
        <div style={styles.screenContainer}>
            <WaveHeader title="Student Roster" />
            <div style={styles.rosterContent}>
                <p style={styles.sectionTitle}>Select Class for Roster</p>
                <div style={{...styles.filterContainer, marginBottom: 20}}>
                     <select style={{...styles.input, flex: 1}} value={selectedDept} onChange={e => setSelectedDept(e.target.value)}>
                          {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                     </select>
                     <select style={{...styles.input, flex: 1}} value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
                          {years.map(year => <option key={year} value={year}>{year}</option>)}
                     </select>
                     <select style={{...styles.input, flex: 1}} value={selectedSection} onChange={e => setSelectedSection(e.target.value)}>
                          {sections.map(section => <option key={section} value={section}>{section}</option>)}
                     </select>
                </div>
                <input
                    style={{ ...styles.input, marginBottom: 10 }}
                    placeholder="Filter by Name or Register Number"
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                />
                <p style={{...styles.sectionTitle, marginTop: 30}}>Current Roster ({filteredRoster.length})</p>
                <div style={styles.rosterList}>
                    {filteredRoster.length > 0 ? (
                        filteredRoster.map((student, index) => (
                            <div key={index} style={styles.rosterItem}>
                                <span>{student.name}</span>
                                <span style={{color: 'grey'}}>{student.regNo}</span>
                            </div>
                        ))
                    ) : (
                        <p style={styles.emptyListMessage}>No students match your filter.</p>
                    )}
                </div>
                <p style={{...styles.sectionTitle, marginTop: 30}}>Upload Students via CSV/Excel</p>
                <div style={styles.rosterUploadSection}>
                    <p>Format should be: RegNo,Name</p>
                    <button style={{...styles.secondaryButton, marginBottom: 10}} onClick={handleDownloadTemplate} disabled={loading}>
                        <span style={styles.secondaryButtonText}>Download Template CSV</span>
                    </button>
                    <label htmlFor="csv-upload" style={styles.uploadButton}>
                        <Icon name="upload" color="#fff" size={20} />
                        <span style={styles.uploadButtonText}>{loading ? 'Uploading...' : 'Upload CSV File'}</span>
                        <input
                            id="csv-upload"
                            type="file"
                            accept=".csv, .xlsx"
                            style={{ display: 'none' }}
                            onChange={handleFileUpload}
                            disabled={loading}
                        />
                    </label>
                </div>
            </div>
        </div>
    );
};
const PieChart = ({ data, radius = 50 }) => {
    let total = data.reduce((sum, d) => sum + (d.value || 0), 0);
    let cumulativeAngle = 0;
    const sectors = data.map((d, index) => {
        const value = d.value || 0;
        const color = d.color || '#ccc';
        const angle = total === 0 ? 0 : (value / total) * 360;
        const startAngle = cumulativeAngle;
        const endAngle = cumulativeAngle + angle;
        cumulativeAngle = endAngle;
        const x1 = radius * Math.cos(startAngle * Math.PI / 180);
        const y1 = radius * Math.sin(startAngle * Math.PI / 180);
        const x2 = radius * Math.cos(endAngle * Math.PI / 180);
        const y2 = radius * Math.sin(endAngle * Math.PI / 180);
        const largeArcFlag = angle > 180 ? 1 : 0;
        const pathData = `
            M 0 0
            L ${x1} ${y1}
            A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
            Z
        `;
        return (
            <path
                key={index}
                d={pathData}
                fill={color}
            />
        );
    });
    return (
        <svg
            width="100%"
            height="100%"
            viewBox="-50 -50 100 100"
            style={{ transform: 'rotate(-90deg)' }}
        >
            {sectors}
        </svg>
    );
};
const BarChart = ({ data, labels }) => {
    if (!data || data.length === 0) {
        return <p style={styles.emptyListMessage}>No data available for the bar chart.</p>;
    }
    const maxVal = Math.max(...data.flatMap(d => [d.present, d.absent, d.onDuty]));
    const svgHeight = 250;
    const barWidth = 10;
    const padding = 5;
    const groupWidth = barWidth * 3 + padding;
    const totalWidth = groupWidth * data.length + padding * (data.length - 1);
    return (
        <div style={styles.chartContainer}>
            <p style={styles.chartTitle}>Daily Attendance Count</p>
            <div style={styles.barChartInnerContainer}>
                <svg width="100%" height={svgHeight} viewBox={`0 0 ${totalWidth + 50} ${svgHeight}`} preserveAspectRatio="xMinYMid meet">
                    <line x1="30" y1="15" x2="30" y2={svgHeight - 15} stroke="#ddd" />
                    <text x="25" y="15" fontSize="10" fill="#555" textAnchor="end">{Math.ceil(maxVal)}</text>
                    <text x="25" y={svgHeight / 2} fontSize="10" fill="#555" textAnchor="end">{Math.ceil(maxVal / 2)}</text>
                    <text x="25" y={svgHeight - 15} fontSize="10" fill="#555" textAnchor="end">0</text>
                    {data.map((d, i) => {
                        const x = i * groupWidth + padding + 30;
                        const presentHeight = (d.present / maxVal) * (svgHeight - 30);
                        const absentHeight = (d.absent / maxVal) * (svgHeight - 30);
                        const onDutyHeight = (d.onDuty / maxVal) * (svgHeight - 30);
                        return (
                            <g key={i} transform={`translate(${x}, 0)`}>
                                <rect
                                    x="0"
                                    y={svgHeight - presentHeight - 15}
                                    width={barWidth}
                                    height={presentHeight}
                                    fill="#2ecc71"
                                    rx="2" ry="2"
                                />
                                <rect
                                    x={barWidth + padding/2}
                                    y={svgHeight - absentHeight - 15}
                                    width={barWidth}
                                    height={absentHeight}
                                    fill="#e74c3c"
                                    rx="2" ry="2"
                                />
                                <rect
                                    x={barWidth * 2 + padding}
                                    y={svgHeight - onDutyHeight - 15}
                                    width={barWidth}
                                    height={onDutyHeight}
                                    fill="#f39c12"
                                    rx="2" ry="2"
                                />
                                <text
                                    x={groupWidth/2}
                                    y={svgHeight + 5}
                                    fontSize="10"
                                    fill="#555"
                                    textAnchor="middle"
                                    transform={`rotate(45, ${x + groupWidth/2}, ${svgHeight + 5})`}
                                >{labels[i]}</text>
                            </g>
                        );
                    })}
                </svg>
            </div>
            <div style={styles.chartLegend}>
                <div style={styles.pieChartLegendItem}>
                    <span style={{ backgroundColor: '#2ecc71', ...styles.pieChartLegendColor }}></span>
                    <p>Present</p>
                </div>
                <div style={styles.pieChartLegendItem}>
                    <span style={{ backgroundColor: '#e74c3c', ...styles.pieChartLegendColor }}></span>
                    <p>Absent</p>
                </div>
                <div style={styles.pieChartLegendItem}>
                    <span style={{ backgroundColor: '#f39c12', ...styles.pieChartLegendColor }}></span>
                    <p>On Duty</p>
                </div>
            </div>
        </div>
    );
};
const DashboardScreen = ({ attendanceRecords = [], userProfile = {}, departments, showMessage, studentList }) => {
    const [selectedDept, setSelectedDept] = useState(userProfile.department || departments[0]);
    const [selectedYear, setSelectedYear] = useState('First Year');
    const [selectedSection, setSelectedSection] = useState('Section A');
    const [dateRange, setDateRange] = useState('Semester');
    const years = ['First Year', 'Second Year', 'Third Year', 'Fourth Year'];
    const sections = ['Section A', 'Section B'];
    const now = useMemo(() => new Date(), []);
    const weekAgo = useMemo(() => {
        const d = new Date(now);
        d.setDate(now.getDate() - 7);
        return d;
    }, [now]);
    const monthAgo = useMemo(() => {
        const d = new Date(now);
        d.setMonth(now.getMonth() - 1);
        return d;
    }, [now]);
    const semesterAgo = useMemo(() => {
        const d = new Date(now);
        d.setMonth(now.getMonth() - 6);
        return d;
    }, [now]);
    const getChartData = useCallback((records) => {
        const total = records.reduce((sum, rec) => sum +
            (rec.morning_attendance?.reduce((mSum, p) => mSum + (p.total || 0), 0) || 0) +
            (rec.afternoon_attendance?.reduce((aSum, p) => aSum + (p.total || 0), 0) || 0), 0);
        const present = records.reduce((sum, rec) => sum +
            (rec.morning_attendance?.reduce((mSum, p) => mSum + (p.present || 0), 0) || 0) +
            (rec.afternoon_attendance?.reduce((aSum, p) => aSum + (p.present || 0), 0) || 0), 0);
        const absent = records.reduce((sum, rec) => sum +
            (rec.morning_attendance?.reduce((mSum, p) => mSum + (p.absent || 0), 0) || 0) +
            (rec.afternoon_attendance?.reduce((aSum, p) => aSum + (p.absent || 0), 0) || 0), 0);
        const onDuty = records.reduce((sum, rec) => sum +
            (rec.morning_attendance?.reduce((mSum, p) => mSum + (p.onDuty || 0), 0) || 0) +
            (rec.afternoon_attendance?.reduce((aSum, p) => aSum + (p.onDuty || 0), 0) || 0), 0);
        if (total === 0) return [];
        return [
            { label: 'Present', value: (present / total) * 100, color: '#2ecc71' },
            { label: 'Absent', value: (absent / total) * 100, color: '#e74c3c' },
            { label: 'On Duty', value: (onDuty / total) * 100, color: '#f39c12' },
        ];
    }, []);
    const getDailyData = useCallback((records) => {
        const dailyData = records.reduce((acc, record) => {
            const dateStr = new Date(record.date).toLocaleDateString();
            if (!acc[dateStr]) {
                acc[dateStr] = { present: 0, absent: 0, onDuty: 0 };
            }
            const morningData = record.morning_attendance;
            const afternoonData = record.afternoon_attendance;
            acc[dateStr].present += [...morningData, ...afternoonData].reduce((sum, p) => sum + (p.present || 0), 0);
            acc[dateStr].absent += [...morningData, ...afternoonData].reduce((sum, p) => sum + (p.absent || 0), 0);
            acc[dateStr].onDuty += [...morningData, ...afternoonData].reduce((sum, p) => sum + (p.onDuty || 0), 0);
            return acc;
        }, {});
        const labels = Object.keys(dailyData).sort((a, b) => new Date(a) - new Date(b));
        const dataPoints = labels.map(label => ({
            ...dailyData[label],
            date: label
        }));
        return { labels, dataPoints };
    }, []);
    const getRosterKey = () => `${selectedDept}-${selectedYear}-${selectedSection}`;
    const studentRoster = useMemo(() => {
        return studentList[getRosterKey()] || [];
    }, [studentList, selectedDept, selectedYear, selectedSection]);
    const filteredRecords = useMemo(() => {
        let fromDate = null;
        if (dateRange === 'Week') fromDate = weekAgo;
        if (dateRange === 'Month') fromDate = monthAgo;
        if (dateRange === 'Semester') fromDate = semesterAgo;
        return attendanceRecords.filter(record => {
            const recordDate = new Date(record.date);
            return record.department === selectedDept &&
                     record.year === selectedYear &&
                     record.section === selectedSection &&
                     (!fromDate || recordDate >= fromDate);
        });
    }, [attendanceRecords, selectedDept, selectedYear, selectedSection, dateRange, weekAgo, monthAgo, semesterAgo]);
    const chartData = getChartData(filteredRecords);
    const { labels: barChartLabels, dataPoints: barChartData } = getDailyData(filteredRecords);
    const handleExportCSV = () => {
        if (filteredRecords.length === 0) {
            showMessage(`No data available to export for ${selectedDept} - ${selectedYear} ${selectedSection}.`);
            return;
        }
        const studentHeaders = [
            'RegNo', 'Name', 'Attendance (%)'
        ];
        const studentRows = studentRoster.map(student => {
            const studentStats = calcStudentAttendance(filteredRecords, student.regNo);
            return [
                `"${student.regNo}"`,
                `"${student.name}"`,
                studentStats
            ].join(',');
        });
        const dailyHeaders = ['Date', 'Session', 'Period', 'Total', 'Present', 'Absent', 'On Duty', 'Absent Numbers'];
        const dailyRows = filteredRecords.flatMap(rec => {
            const morningData = rec.morning_attendance;
            const afternoonData = rec.afternoon_attendance;
            const morningRows = morningData.map((p, i) => [
                new Date(rec.date).toLocaleDateString(),
                'Morning',
                i + 1,
                p.total,
                p.present,
                p.absent,
                p.onDuty,
                `"${(p.absentNumbers || '').replace(/"/g, '""')}"`
            ]);
            const afternoonRows = afternoonData.map((p, i) => [
                new Date(rec.date).toLocaleDateString(),
                'Afternoon',
                i + 5,
                p.total,
                p.present,
                p.absent,
                p.onDuty,
                `"${(p.absentNumbers || '').replace(/"/g, '""')}"`
            ]);
            return [...morningRows, ...afternoonRows];
        }).map(row => row.join(','));
        const csvContent = [
            'Student-wise Attendance Summary',
            studentHeaders.join(','),
            ...studentRows,
            '',
            'Daily Attendance Records',
            dailyHeaders.join(','),
            ...dailyRows
        ].join('\n');
        const filename = `${selectedDept}-${selectedYear}-${selectedSection}_${dateRange}_report.csv`;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showMessage('CSV report downloaded!');
    };
    return (
        <div style={styles.screenContainer}>
             <WaveHeader title="Dashboard & Reports" />
             <div style={styles.dashboardContent}>
                 <p style={styles.sectionTitle}>Attendance Breakdown</p>
                 <div style={styles.chartSelectionForm}>
                      <p>Select Class and Date Range</p>
                      <div style={{...styles.filterContainer, flexWrap: 'wrap'}}>
                           <select style={{...styles.input, flex: 1}} value={selectedDept} onChange={e => setSelectedDept(e.target.value)}>
                                {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                           </select>
                           <select style={{...styles.input, flex: 1}} value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
                                {years.map(year => <option key={year} value={year}>{year}</option>)}
                           </select>
                           <select style={{...styles.input, flex: 1}} value={selectedSection} onChange={e => setSelectedSection(e.target.value)}>
                                {sections.map(section => <option key={section} value={section}>{section}</option>)}
                           </select>
                           <select style={{...styles.input, flex: 1, minWidth: '120px'}} value={dateRange} onChange={e => setDateRange(e.target.value)}>
                                <option value="Semester">Semester</option>
                                <option value="Month">Month</option>
                                <option value="Week">Week</option>
                           </select>
                      </div>
                 </div>
                 <div style={styles.chartContainer}>
                      <div style={styles.pieChartContainer}>
                            <PieChart data={chartData} />
                      </div>
                      <div style={styles.chartLegend}>
                           {chartData.length > 0 ? chartData.map((d, i) => (
                               <div key={i} style={styles.pieChartLegendItem}>
                                   <span style={{ backgroundColor: d.color, ...styles.pieChartLegendColor }}></span>
                                   <p>{d.label}: {d.value.toFixed(1)}%</p>
                               </div>
                           )) : (
                               <p style={{fontStyle: 'italic', color: '#777'}}>No data for this class and period.</p>
                           )}
                      </div>
                 </div>
                 <div style={styles.barChartContainer}>
                       <BarChart data={barChartData} labels={barChartLabels} />
                 </div>
                 <button style={styles.exportButton} onClick={handleExportCSV}>
                       <Icon name="download" size={20} color="#fff" />
                       <span style={styles.exportButtonText}>Export {dateRange} Report</span>
                 </button>
             </div>
        </div>
    );
};
const ShareScreen = ({ attendanceRecords, userProfile, departments, showMessage }) => {
    const [selectedDept, setSelectedDept] = useState(userProfile?.department || departments[0]);
    const [selectedYear, setSelectedYear] = useState('First Year');
    const [selectedSection, setSelectedSection] = useState('Section A');
    const [copied, setCopied] = useState(false);
    const summaryRef = React.useRef();
    const years = ['First Year', 'Second Year', 'Third Year', 'Fourth Year'];
    const sections = ['Section A', 'Section B'];
    const filteredRecords = attendanceRecords.filter(record =>
        record.department === selectedDept &&
        record.year === selectedYear &&
        record.section === selectedSection
    );
    const now = useMemo(() => new Date(), []);
    const weekAgo = useMemo(() => {
        const d = new Date(now);
        d.setDate(now.getDate() - 7);
        return d;
    }, [now]);
    const monthAgo = useMemo(() => {
        const d = new Date(now);
        d.setMonth(now.getMonth() - 1);
        return d;
    }, [now]);
    function calcPeriodPercent(records, fromDate) {
        const filtered = records.filter(rec => new Date(rec.date) >= fromDate);
        const total = filtered.reduce((sum, rec) => sum + 
            (rec.morning_attendance?.reduce((mSum, p) => mSum + (p.total || 0), 0) || 0) +
            (rec.afternoon_attendance?.reduce((aSum, p) => aSum + (p.total || 0), 0) || 0), 0);
        const present = filtered.reduce((sum, rec) => sum + 
            (rec.morning_attendance?.reduce((mSum, p) => mSum + (p.present || 0), 0) || 0) +
            (rec.afternoon_attendance?.reduce((aSum, p) => aSum + (p.present || 0), 0) || 0), 0);
        return total ? ((present / total) * 100).toFixed(1) : '0.0';
    }
    const weeklyPercent = calcPeriodPercent(filteredRecords, weekAgo);
    const monthlyPercent = calcPeriodPercent(filteredRecords, monthAgo);
    const summaryText = filteredRecords.length > 0
        ? `Weekly Attendance: ${weeklyPercent}%\nMonthly Attendance: ${monthlyPercent}%\n\n` +
          filteredRecords.map(rec => {
            const morningData = rec.morning_attendance;
            const afternoonData = rec.afternoon_attendance;
            const morningSummary = morningData.map(p => `P${morningData.indexOf(p)+1}: Total: ${p.total}, Present: ${p.present}, Absent: ${p.absent}, OD: ${p.onDuty}`).join('\n');
            const afternoonSummary = afternoonData.map(p => `P${afternoonData.indexOf(p)+5}: Total: ${p.total}, Present: ${p.present}, Absent: ${p.absent}, OD: ${p.onDuty}`).join('\n');
            return `Date: ${new Date(rec.date).toLocaleDateString()}\nMorning:\n${morningSummary}\nAfternoon:\n${afternoonSummary}\n`;
        }).join('\n---\n')
        : 'No attendance records for this class.';
    const headers = ['Date', 'Session', 'Period', 'Total', 'Present', 'Absent', 'On Duty', 'Absent Numbers'];
    const csvRows = filteredRecords.flatMap(rec => {
        const morningData = rec.morning_attendance;
        const afternoonData = rec.afternoon_attendance;
        const morningRows = morningData.map((p, i) => [
            new Date(rec.date).toLocaleDateString(),
            'Morning',
            i + 1,
            p.total,
            p.present,
            p.absent,
            p.onDuty,
            `"${(p.absentNumbers || '').replace(/"/g, '""')}"`
        ]);
        const afternoonRows = afternoonData.map((p, i) => [
            new Date(rec.date).toLocaleDateString(),
            'Afternoon',
            i + 5,
            p.total,
            p.present,
            p.absent,
            p.onDuty,
            `"${(p.absentNumbers || '').replace(/"/g, '""')}"`
        ]);
        return [...morningRows, ...afternoonRows];
    }).map(row => row.join(','));
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const handleCopy = () => {
        if (summaryRef.current) {
            summaryRef.current.select();
            document.execCommand('copy');
            showMessage('Attendance summary copied to clipboard!');
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        }
    };
    const handleDownloadCSV = () => {
        const filename = `${selectedDept}-${selectedYear}-${selectedSection}_attendance_share.csv`;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showMessage('CSV file downloaded!');
    };
    const handleWhatsAppShare = () => {
        const text = encodeURIComponent(summaryText);
        window.open(`https://wa.me/?text=${text}`, '_blank');
        showMessage('Opening WhatsApp to share!');
    };
    return (
        <div style={styles.screenContainer}>
            <WaveHeader title="Share Attendance" />
            <div style={{ padding: 20 }}>
                <p style={styles.sectionTitle}>Select Class to Share</p>
                <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                    <select style={{...styles.input, flex: 1}} value={selectedDept} onChange={e => setSelectedDept(e.target.value)}>
                        {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                    </select>
                    <select style={{...styles.input, flex: 1}} value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
                        {years.map(year => <option key={year} value={year}>{year}</option>)}
                    </select>
                    <select style={{...styles.input, flex: 1}} value={selectedSection} onChange={e => setSelectedSection(e.target.value)}>
                        {sections.map(section => <option key={section} value={section}>{section}</option>)}
                    </select>
                </div>
                <div style={{ background: '#fff', borderRadius: 10, padding: 15, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <p style={{ fontWeight: 'bold', marginBottom: 10 }}>Attendance Summary:</p>
                    <p><strong>Weekly Attendance:</strong> {weeklyPercent}%</p>
                    <p><strong>Monthly Attendance:</strong> {monthlyPercent}%</p>
                    <textarea
                        ref={summaryRef}
                        style={{ width: '100%', height: 120, borderRadius: 8, border: '1px solid #eee', padding: 10, fontFamily: 'monospace', fontSize: 14, resize: 'vertical' }}
                        value={summaryText}
                        readOnly
                    />
                </div>
                <div style={{ display: 'flex', gap: 10, flexDirection: 'column' }}>
                    <button style={{ ...styles.submitButton, flex: 1 }} onClick={handleCopy}>
                        <Icon name="share" size={20} color="#fff" />
                        <span style={{ marginLeft: 8 }}>{copied ? 'Copied!' : 'Copy Summary'}</span>
                    </button>
                    <button style={{ ...styles.submitButton, flex: 1, backgroundColor: '#2ecc71' }} onClick={handleDownloadCSV}>
                        <Icon name="download" size={20} color="#fff" />
                        <span style={{ marginLeft: 8 }}>Download CSV</span>
                    </button>
                    <button style={{ ...styles.submitButton, flex: 1, backgroundColor: '#25D366' }} onClick={handleWhatsAppShare}>
                        <span style={{ marginRight: 8 }}>🟢</span>
                        <span>Share via WhatsApp (Text)</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
const SettingsScreen = ({ navigate, userProfile }) => {
    if (!userProfile) return null;
    const { name, position, employeeId, department } = userProfile;
    const initial = name ? name.charAt(0).toUpperCase() : 'U';
    const ProfileDetail = ({ icon, label, value }) => (
        <div style={styles.profileDetailRow}>
            <Icon name={icon} size={24} color="#555" />
            <div style={styles.profileDetailTextContainer}>
                <p style={styles.profileDetailLabel}>{label}</p>
                <p style={styles.profileDetailValue}>{value || 'Not Set'}</p>
            </div>
        </div>
    );
    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('Auth');
    };
    return (
        <div style={styles.screenContainer}>
            <WaveHeader title="Faculty Profile" />
            <div style={styles.settingsContent}>
                <div style={styles.profileCard}>
                    <div style={styles.profileCardHeader}>
                        <div style={styles.avatar}>
                            <p style={styles.avatarLetter}>{initial}</p>
                        </div>
                        <div style={{marginLeft: 15}}>
                            <p style={styles.profileName}>{name || 'User Name'}</p>
                            <p style={styles.profilePosition}>{position || 'Position'}</p>
                        </div>
                    </div>
                    <div style={styles.profileDetailsContainer}>
                        <ProfileDetail icon="id" label="Employee ID" value={employeeId} />
                        <ProfileDetail icon="briefcase" label="Department" value={department} />
                        <ProfileDetail icon="user" label="Role" value={userProfile.role} />
                    </div>
                </div>
                <button style={styles.logoutButton} onClick={handleLogout}>
                    <span style={styles.logoutButtonText}>Logout</span>
                </button>
            </div>
        </div>
    );
};
const FilterExportScreen = ({ studentList, attendanceRecords, departments, showMessage }) => {
    const [selectedDept, setSelectedDept] = useState(departments[0]);
    const [selectedYear, setSelectedYear] = useState('First Year');
    const [selectedSection, setSelectedSection] = useState('Section A');
    const [minAttendance, setMinAttendance] = useState(0);
    const [maxAttendance, setMaxAttendance] = useState(100);
    const dateRange = 'Semester';
    const years = ['First Year', 'Second Year', 'Third Year', 'Fourth Year'];
    const sections = ['Section A', 'Section B'];
    const now = useMemo(() => new Date(), []);
    const semesterAgo = useMemo(() => {
        const d = new Date(now);
        d.setMonth(now.getMonth() - 6);
        return d;
    }, [now]);
    const studentsWithAttendance = useMemo(() => {
        const rosterKey = `${selectedDept}-${selectedYear}-${selectedSection}`;
        const roster = studentList[rosterKey] || [];
        const fromDate = semesterAgo;
        const filteredRecords = attendanceRecords.filter(record =>
            record.department === selectedDept &&
            record.year === selectedYear &&
            record.section === selectedSection &&
            new Date(record.date) >= fromDate
        );
        return roster.map(student => ({
            ...student,
            attendance: calcStudentAttendance(filteredRecords, student.regNo)
        }));
    }, [studentList, selectedDept, selectedYear, selectedSection, attendanceRecords, semesterAgo]);
    const filteredStudents = useMemo(() => {
        return studentsWithAttendance.filter(student =>
            parseFloat(student.attendance) >= minAttendance &&
            parseFloat(student.attendance) <= maxAttendance
        );
    }, [studentsWithAttendance, minAttendance, maxAttendance]);
    const handleExportFilteredCSV = () => {
        if (filteredStudents.length === 0) {
            showMessage("No students to export based on current filters.");
            return;
        }
        const headers = ['RegNo', 'Name', 'Attendance (%)'];
        const csvRows = filteredStudents.map(student => [
            `"${student.regNo}"`,
            `"${student.name}"`,
            student.attendance
        ].join(','));
        const csvContent = [headers.join(','), ...csvRows].join('\n');
        const filename = `${selectedDept}-${selectedYear}-${selectedSection}_filtered_attendance.csv`;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
    return (
        <div style={styles.screenContainer}>
            <WaveHeader title="Student Filter" />
            <div style={styles.rosterContent}>
                <p style={styles.sectionTitle}>Filter Students by Attendance</p>
                <div style={{ ...styles.filterContainer, marginBottom: 20, flexWrap: 'wrap' }}>
                    <select style={{ ...styles.input, flex: 1 }} value={selectedDept} onChange={e => setSelectedDept(e.target.value)}>
                        {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                    </select>
                    <select style={{ ...styles.input, flex: 1 }} value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
                        {years.map(year => <option key={year} value={year}>{year}</option>)}
                    </select>
                    <select style={{ ...styles.input, flex: 1 }} value={selectedSection} onChange={e => setSelectedSection(e.target.value)}>
                        {sections.map(section => <option key={section} value={section}>{section}</option>)}
                    </select>
                    <select style={{...styles.input, flex: 1}} value={dateRange} disabled>
                        <option value="Semester">Semester</option>
                    </select>
                </div>
                <div style={styles.attendanceFilterGroup}>
                    <p style={{ fontWeight: 'bold' }}>Attendance % Range:</p>
                    <div style={styles.attendanceFilterInputs}>
                        <input
                            type="number"
                            style={styles.attendanceInput}
                            value={minAttendance}
                            onChange={e => setMinAttendance(e.target.value)}
                            min="0"
                            max="100"
                            placeholder="Min"
                        />
                        <span style={{ margin: '0 10px' }}>-</span>
                        <input
                            type="number"
                            style={styles.attendanceInput}
                            value={maxAttendance}
                            onChange={e => setMaxAttendance(e.target.value)}
                            min="0"
                            max="100"
                            placeholder="Max"
                        />
                    </div>
                </div>
                <p style={{ ...styles.sectionTitle, marginTop: 30 }}>Filtered Roster ({filteredStudents.length})</p>
                <div style={styles.rosterList}>
                    {filteredStudents.length > 0 ? (
                        filteredStudents.map((student, index) => (
                            <div key={index} style={styles.rosterItem}>
                                <span>{student.name}</span>
                                <span style={{ color: 'grey' }}>{student.regNo}</span>
                                <span style={{ color: '#2ecc71', fontWeight: 'bold' }}>
                                    {student.attendance}%
                                </span>
                            </div>
                        ))
                    ) : (
                        <p style={styles.emptyListMessage}>No students match your filter.</p>
                    )}
                </div>
                <button style={styles.exportButton} onClick={handleExportFilteredCSV}>
                    <Icon name="download" size={20} color="#fff" />
                    <span style={styles.exportButtonText}>Export Filtered CSV</span>
                </button>
            </div>
        </div>
    );
};
const MainApp = ({ navigate, params, attendanceRecords, addAttendanceRecord, userProfile, currentYear, currentSection, currentDepartment, studentList, setStudentList, showMessage, departments }) => {
    const [activeTab, setActiveTab] = useState(params?.screen || 'Home');
    useEffect(() => {
        if (params && params.screen) {
            setActiveTab(params.screen);
        }
    }, [params]);
    const tabs = ['Home', 'Attendance', 'Dashboard', 'Roster', 'Share', 'Filter', 'Settings'];
    const tabIcons = { Home: 'home', Attendance: 'edit', Dashboard: 'chart', Roster: 'people', Share: 'share', Filter: 'filter', Settings: 'settings' };
    const renderTabScreen = () => {
        switch(activeTab) {
            case 'Home':
                return <DepartmentScreen navigate={navigate} attendanceRecords={attendanceRecords} userProfile={userProfile} departments={departments} />;
            case 'Attendance':
                return <AttendanceScreen
                    addAttendanceRecord={addAttendanceRecord}
                    year={currentYear}
                    section={currentSection}
                    department={currentDepartment}
                    navigate={navigate}
                    showMessage={showMessage}
                    studentList={studentList}
                />;
            case 'Dashboard':
                return <DashboardScreen
                    attendanceRecords={attendanceRecords}
                    userProfile={userProfile}
                    departments={departments}
                    showMessage={showMessage}
                    studentList={studentList}
                />;
            case 'Roster':
                return <RosterScreen
                    studentList={studentList}
                    setStudentList={setStudentList}
                    showMessage={showMessage}
                    departments={departments}
                    userId={userProfile?.userId}
                />;
            case 'Share':
                return <ShareScreen
                    attendanceRecords={attendanceRecords}
                    userProfile={userProfile}
                    departments={departments}
                    showMessage={showMessage}
                />;
            case 'Filter':
                return <FilterExportScreen
                    studentList={studentList}
                    attendanceRecords={attendanceRecords}
                    departments={departments}
                    showMessage={showMessage}
                />;
            case 'Settings':
                return <SettingsScreen
                    navigate={navigate}
                    userProfile={userProfile}
                />;
            default:
                return <DepartmentScreen navigate={navigate} attendanceRecords={attendanceRecords} userProfile={userProfile} departments={departments} />;
        }
    };
    return (
        <div style={styles.mainAppContainer}>
            <div style={styles.mainContent}>
                {renderTabScreen()}
            </div>
            <div style={styles.tabBar}>
                {tabs.map(tab => (
                    <button key={tab} style={styles.tabButton} onClick={() => setActiveTab(tab)}>
                        <Icon name={tabIcons[tab]} size={24} color={activeTab === tab ? '#8e44ad' : 'gray'} />
                    </button>
                ))}
            </div>
        </div>
    );
};
export default function App() {
    const [page, setPage] = useState('Auth');
    const [params, setParams] = useState({});
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [studentList, setStudentList] = useState({});
    const [userProfile, setUserProfile] = useState(null);
    const [currentDepartment, setCurrentDepartment] = useState('');
    const [currentYear, setCurrentYear] = useState('');
    const [currentSection, setCurrentSection] = useState('');
    const [message, setMessage] = useState('');
    const [loadingData, setLoadingData] = useState(false);
    
    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                if (profileData) {
                    setUserProfile({
                        name: profileData.full_name,
                        position: profileData.role,
                        employeeId: profileData.employee_id,
                        department: profileData.department,
                        role: profileData.role,
                        userId: user.id,
                    });
                    setPage('MainApp');
                }
            } else {
                setPage('Auth');
            }
        };
        checkAuth();

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                const { user } = session;
                supabase.from('profiles').select('*').eq('id', user.id).single()
                    .then(({ data: profileData }) => {
                        if (profileData) {
                            setUserProfile({
                                name: profileData.full_name,
                                position: profileData.role,
                                employeeId: profileData.employee_id,
                                department: profileData.department,
                                role: profileData.role,
                                userId: user.id,
                            });
                            setPage('MainApp');
                        }
                    });
            } else {
                setUserProfile(null);
                setPage('Auth');
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const showMessage = (msg) => {
        setMessage(msg);
    };

    const hideMessage = () => {
        setMessage('');
    };

    useEffect(() => {
        if (!userProfile || !userProfile.userId) return;
        setLoadingData(true);
        const fetchAllData = async () => {
            try {
                const [attendanceRes, rosterRes] = await Promise.all([
                    supabase.from('attendance_records').select('*').eq('user_id', userProfile.userId),
                    supabase.from('student_rosters').select('*').eq('user_id', userProfile.userId),
                ]);
                setAttendanceRecords(attendanceRes.data || []);
                const rosterMap = {};
                if (rosterRes.data) {
                    rosterRes.data.forEach(item => {
                        const key = `${item.department}-${item.year}-${item.section}`;
                        rosterMap[key] = item.roster_data;
                    });
                }
                setStudentList(rosterMap);
            } catch (err) {
                console.error('An unexpected error occurred during data fetch:', err);
            } finally {
                setLoadingData(false);
            }
        };
        fetchAllData();
    }, [userProfile]);

    const addAttendanceRecord = async (newRecord) => {
        try {
            const { data, error } = await supabase
                .from('attendance_records')
                .insert([{
                    ...newRecord,
                    user_id: userProfile.userId,
                }])
                .select();
            if (error) {
                showMessage(`Error submitting attendance: ${error.message}`);
            } else {
                showMessage("Report Submitted!");
                const { data: attendanceData } = await supabase
                    .from('attendance_records')
                    .select('*')
                    .eq('user_id', userProfile.userId);
                setAttendanceRecords(attendanceData || []);
            }
        } catch (err) {
            showMessage(`An unexpected error occurred: ${err.message}`);
        }
    };
    const navigate = (newPage, newParams = {}) => {
        if (newParams.department) setCurrentDepartment(newParams.department);
        if (newParams.year) setCurrentYear(newParams.year);
        if (newParams.section) setCurrentSection(newParams.section);
        setPage(newPage);
        setParams(newParams);
    };
    const departments = [
        'Aeronautical Engineering', 'Artificial Intelligence & Data Science', 'Computer Science & Engineering',
        'Mechanical Engineering', 'Civil Engineering', 'Electrical & Electronics Engineering',
        'Electronics & Communication Engineering', 'Information Technology', 'Chemical Engineering',
        'Mechatronics','Computer Science and Bussiness Science'
    ];
    const renderPage = () => {
        if (loadingData) {
            return <div style={{...styles.appContainer, display: 'flex', justifyContent: 'center', alignItems: 'center'}}><p>Loading data...</p></div>;
        }
        if (!userProfile) {
            return <AuthScreen navigate={navigate} setUserProfile={setUserProfile} showMessage={showMessage} />;
        }
        switch (page) {
            case 'Auth':
                return <AuthScreen navigate={navigate} setUserProfile={setUserProfile} showMessage={showMessage} />;
            case 'MainApp':
                return <MainApp
                    navigate={navigate}
                    params={params}
                    attendanceRecords={attendanceRecords}
                    addAttendanceRecord={addAttendanceRecord}
                    userProfile={userProfile}
                    currentYear={currentYear}
                    currentSection={currentSection}
                    currentDepartment={currentDepartment}
                    studentList={studentList}
                    setStudentList={setStudentList}
                    showMessage={showMessage}
                    departments={departments}
                />;
            case 'Year':
                return <YearScreen navigate={navigate} params={params} />;
            case 'Section':
                return <SectionScreen navigate={navigate} params={params} />;
            default:
                return <MainApp
                    navigate={navigate}
                    params={params}
                    attendanceRecords={attendanceRecords}
                    userProfile={userProfile}
                    departments={departments}
                />;
        }
    };
    return (
        <div style={styles.appContainer}>
            {renderPage()}
            <MessageBox message={message} onClose={hideMessage} />
        </div>
    );
}

const styles = {
    appContainer: {
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden', // Prevent double scrollbars
    },
    mainAppContainer: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden', // Prevent double scrollbars
    },
    mainContent: {
        flex: 1,
        overflowY: 'auto',
        paddingBottom: 80, // Add bottom padding so content is not hidden behind tabBar
    },
    tabBar: {
        display: 'flex',
        height: 60,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        backgroundColor: '#fff',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
        flexShrink: 0,
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
    },
    authContainer: { height: '100vh',
                    backgroundColor: '#fff',
                    position: 'relative'  
                    },
    authTopBg: { height: '50%',
                  backgroundColor: '#8e44ad'  
                },
    authContent: { position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',  
                    },
    authCard: { width: '85%',
                maxWidth: 400,
                backgroundColor: '#fff',
                borderRadius: 20,
                padding: 25,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
                },
    authTitle: { fontSize: 24,
                  fontWeight: 'bold',
                  marginBottom: 20,
                  margin: 0
                  },
    input: { width: '100%',
             boxSizing: 'border-box',
             backgroundColor: '#f0f0f0',
             borderRadius: 15,
             padding: 15,
             marginBottom: 15,
             fontSize: 16,
             border: '1px solid #eee',
             appearance: 'none',
             },
    mainButton: { width: '100%',
                  backgroundColor: '#fff',
                  borderRadius: 15,
                  padding: 15,
                  alignItems: 'center',
                  marginTop: 10,
                  border: '1px solid #ddd',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                  cursor: 'pointer',
                  },
    mainButtonText: { fontSize: 18,
                      fontWeight: 'bold',
                      color: '#333'  
                      },
    secondaryButton: { width: '100%',
                        backgroundColor: '#8e44ad',
                        borderRadius: 15,
                        padding: 15,
                        alignItems: 'center',
                        border: 'none',
                        cursor: 'pointer',
                        marginTop: 10,
                        },
    secondaryButtonText: { fontSize: 18,
                           fontWeight: 'bold',
                           color: '#fff'  
                           },
    logoContainer: { display: 'flex',
                      alignItems: 'center',
                      marginTop: 20,  
                      },
    logoImage: { width: 150,
                  height: 70,
                  marginRight: 15,
                  borderRadius: 10,
                  },
    logoTextContainer: { display: 'flex',
                          flexDirection: 'column'  
                          },
    errorText: { color: 'red',
                  marginBottom: 10,
                  },
    screenContainer: { display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                        backgroundColor: '#f5f5f5'
                        },
    headerContainer: { height: 180,
                        position: 'relative',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexShrink: 0,
                        },
    headerTitle: { fontSize: 22,
                    color: '#fff',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    marginTop: 30,
                    lineHeight: 1.4,
                    position: 'relative',
                    padding: '0 20px',
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    },
    headerRect: { height: '100%',
                  width: '100%',
                  backgroundColor: '#8e44ad',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  },
    backButton: { position: 'absolute',
                    top: 45,
                    left: 15,
                    background: 'transparent',
                    border: 'none',
                    padding: '10px',
                    cursor: 'pointer',
                    zIndex: 10,  
                    },
    sectionTitle: { fontSize: 20,
                    fontWeight: 'bold',
                    margin: '20px 20px 10px 20px',
                    },
    deptButton: { backgroundColor: '#fff',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: '15px 20px',
                  borderRadius: 15,
                  margin: '8px 20px',
                  boxShadow: '0 1px 5px rgba(0,0,0,0.1)',
                  border: 'none',
                  width: 'calc(100% - 40px)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  },
    deptButtonText: { fontSize: 16,
                      marginLeft: 15,
                      whiteSpace: 'normal',
                      flex: 1,
                      },
    yearGrid: { display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-around',
                padding: '0 10px',
                },
    yearCard: { width: '45%',
                height: 150,
                backgroundColor: '#8e44ad',
                borderRadius: 20,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 20,
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                },
    yearCardNumber: { fontSize: 28,
                      fontWeight: 'bold',
                      },
    yearCardText: { fontSize: 18,
                    },
    attendanceForm: { backgroundColor: '#fff',
                      borderRadius: 15,
                      padding: 20,  
                      },
    attendanceRow: { display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 15,
                      },
    attendanceInput: { width: 80,
                        height: 40,
                        backgroundColor: '#f0f0f0',
                        borderRadius: 8,
                        border: '1px solid #ddd',
                        textAlign: 'center',
                        fontSize: 16,
                        },
    largeInput: { backgroundColor: '#f0f0f0',
                  borderRadius: 8,
                  height: 60,
                  width: '100%',
                  boxSizing: 'border-box',
                  border: '1px solid #ddd',
                  padding: 10,
                  fontFamily: 'sans-serif',
                  fontSize: 14,  
                  },
    submitButton: { backgroundColor: '#8e44ad',
                    borderRadius: 15,
                    padding: 15,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 20,
                    border: 'none',
                    color: '#fff',
                    width: '100%',
                    cursor: 'pointer',
                    },
    submitButtonText: { fontSize: 16,
                        fontWeight: 'bold',
                        },
    dashboardContent: { flex: 1,
                        padding: 20,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        },
    filterContainer: { display: 'flex',
                       justifyContent: 'space-between',
                       width: '100%',
                       marginBottom: 20,
                       },
    filterButton: { flex: 1,
                    padding: '10px 5px',
                    margin: '0 5px',
                    borderRadius: 10,
                    border: '1px solid #8e44ad',
                    backgroundColor: '#fff',
                    color: '#8e44ad',
                    cursor: 'pointer',
                    fontSize: 14,
                    },
    filterButtonActive: { flex: 1,
                          padding: '10px 5px',
                          margin: '0 5px',
                          borderRadius: 10,
                          border: '1px solid #8e44ad',
                          backgroundColor: '#8e44ad',
                          color: '#fff',
                          cursor: 'pointer',
                          fontSize: 14,  
                          },
    progressCard: { backgroundColor: '#fff',
                    borderRadius: 20,
                    padding: 20,
                    width: '100%',
                    boxSizing: 'border-box',
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: 20,
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    },
    progressCircleContainer: { position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                },
    progressText: { position: 'absolute',
                    fontSize: 24,
                    fontWeight: 'bold',
                    margin: 0,
                    },
    progressLabel: { fontSize: 16,
                      fontWeight: '500',
                      marginTop: 10,
                      margin: 0,
                      textAlign: 'center'
                      },
    shareButtonsContainer: { display: 'flex',
                              justifyContent: 'space-between',
                              width: '100%',
                              marginTop: 10,
                              gap: '10px'
                              },
    shareButton: { borderRadius: 15,
                    padding: 15,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer',
                    flex: 1,
                    fontSize: '14px'
                    },
    settingsContent: { flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '20px',  
                        },
    profileCard: { width: '100%',
                    backgroundColor: '#fff',
                    borderRadius: 20,
                    padding: 20,
                    boxSizing: 'border-box',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    },
    profileCardHeader: { display: 'flex',
                          alignItems: 'center',
                          borderBottom: '1px solid #eee',
                          paddingBottom: 20,
                          },
    avatar: { width: 70,
              height: 70,
              borderRadius: 35,
              backgroundColor: '#8e44ad',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexShrink: 0,  
              },
    avatarLetter: { color: '#fff',
                    fontSize: 32,
                    fontWeight: 'bold',
                    margin: 0,
                    },
    profileName: { fontSize: 22,
                    fontWeight: 'bold',
                    margin: 0,  
                    },
    profilePosition: { color: 'grey',
                        margin: '0',
                        fontSize: 16,
                        },
    profileDetailsContainer: { paddingTop: 20, },
    profileDetailRow: { display: 'flex',
                        alignItems: 'center',
                        marginBottom: 15,  
                        },
    profileDetailTextContainer: { marginLeft: 15, },
    profileDetailLabel: { margin: 0,
                          color: 'grey',
                          fontSize: 14,  
                          },
    profileDetailValue: { margin: 0,  
                          fontSize: 16,  
                          fontWeight: '500',  
                          },
    logoutButton: { backgroundColor: '#8e44ad',
                    borderRadius: 15,
                    padding: 15,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    marginTop: 'auto',  
                    border: 'none',  
                    cursor: 'pointer',
                    },
    logoutButtonText: { color: '#fff',
                        fontSize: 16,
                        fontWeight: 'bold', },
    tabBar: {
        display: 'flex',
        height: 60,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        backgroundColor: '#fff',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
        flexShrink: 0,
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
    },
    tabButton: { flex: 1,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  },
    chartSelectionForm: { backgroundColor: '#fff',
                          borderRadius: 15,
                          padding: 20,
                          marginBottom: 20,  
                          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'  
                          },
    rosterContent: { flex: 1,
                      padding: 20,  
                      },
    rosterForm: { backgroundColor: '#fff',
                  padding: 20,
                  borderRadius: 15,
                  marginBottom: 20,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)'  
                  },
    rosterUploadSection: { backgroundColor: '#fff',
                            padding: 20,
                            borderRadius: 15,  
                            marginBottom: 20,  
                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                            },
    uploadButton: { display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 15,
                    backgroundColor: '#8e44ad',
                    color: '#fff',
                    borderRadius: 15,  
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    },
    uploadButtonText: { marginLeft: 10,  
                        fontSize: 16
                        },
    rosterList: { backgroundColor: '#fff',
                  borderRadius: 15,
                  padding: 20,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                  },
    rosterItem: { display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: '1px solid #eee'  
                  },
    emptyListMessage: { textAlign: 'center',
                        color: '#777',
                        fontStyle: 'italic',
                        padding: 20
                        },
    messageBoxOverlay: { position: 'fixed',
                          top: 0,
                          left: 0,  
                          right: 0,
                          bottom: 0,
                          backgroundColor: 'rgba(0, 0, 0, 0.5)',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          zIndex: 1000
                          },
    messageBox: { backgroundColor: '#fff',
                  padding: 20,
                  borderRadius: 15,
                  boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
                  maxWidth: 300,
                  textAlign: 'center'
                  },
    messageText: { fontSize: 16,
                    marginBottom: 20  
                    },
    messageButton: { backgroundColor: '#8e44ad',
                      color: '#fff',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: 10,
                      cursor: 'pointer'
                      },
    pieChartContainer: { display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          width: '100%',
                          maxWidth: 400,
                          margin: '20px auto',
                          position: 'relative',
                          padding: 20,
                          backgroundColor: '#fff',
                          borderRadius: 15,
                          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                          },
    pieChart: { width: '60%',
                height: '100%'  
                },
    pieChartLegend: { width: '40%',
                      paddingLeft: 20  
                      },
    pieChartLegendItem: { display: 'flex',
                          alignItems: 'center',
                          marginBottom: 5
                          },
    pieChartLegendColor: { width: 15,
                            height: 15,
                            borderRadius: '50%',
                            marginRight: 10  
                            },
    barChartContainer: { backgroundColor: '#fff',
                          borderRadius: 15,
                          padding: 20,
                          width: '100%',
                          boxSizing: 'border-box',
                          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                          marginTop: 20
                          },
    chartTitle: { fontSize: 18,
                  fontWeight: 'bold',
                  marginBottom: 10,
                  textAlign: 'center'  
                  },
    barChartInnerContainer: { overflowX: 'auto',
                              width: '100%'
                              },
    sessionButton: {
        flex: 1,
        padding: '10px 20px',
        border: 'none',
        borderRadius: 15,
        fontWeight: 'bold',
        cursor: 'pointer',
    },
    periodGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 10,
        marginBottom: 20,
    },
    periodButton: {
        padding: '15px 20px',
        borderRadius: 15,
        border: '1px solid #ddd',
        fontSize: 16,
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: '0 1px 5px rgba(0,0,0,0.1)',
    },
    periodFormContainer: {
        backgroundColor: '#f9f9f9',
        borderRadius: 15,
        padding: 20,
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        marginTop: 20,
    },
    exportButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#8e44ad',
        color: '#fff',
        borderRadius: 15,
        padding: 15,
        fontWeight: 'bold',
        fontSize: 16,
        border: 'none',
        cursor: 'pointer',
        width: '100%',
        marginTop: 20,
    },
    exportButtonText: {
        marginLeft: 10,
    },
    attendanceFilterGroup: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    },
    attendanceFilterInputs: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,  
    }
};

